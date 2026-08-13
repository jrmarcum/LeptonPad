// ---------------------------------------------------------------------------
// backends/neon-clerk.ts — Clerk for identity, the LeptonPad API for entitlement.
//
// Split of responsibility:
//   • Clerk        — accounts, passwords, sessions, JWT issuance. Never sees a pack.
//   • LeptonPad API — verifies the Clerk JWT, then talks to Neon Postgres.
//                     Runs on Deno Deploy; source in api/main.ts.
//   • Neon         — the same five tables and three functions as before.
//
// The browser never holds a database credential and never reaches Postgres.
// Every entitlement call carries the Clerk session JWT as a bearer token, and
// the API derives the user id from that token alone — a user id supplied by the
// client is ignored, which is what makes the boundary hold.
//
// Offline: clerk.load() needs the network. When it fails we keep booting, because
// role and pack keys are cached in localStorage and the sheets must still open.
// ---------------------------------------------------------------------------

// The headless build: Clerk's session/JWT machinery without its prebuilt UI
// components. LeptonPad renders its own login modal, so the components would be
// dead weight in a bundle the service worker precaches.
import { Clerk } from '@clerk/clerk-js/headless';
import type { Backend, BackendUser, RedeemResult, RoleInfo } from '../backend.ts';
import type { UserRole } from '../types.ts';

// deno-lint-ignore no-explicit-any
const cfg = (globalThis as any).__LP_CONFIG__ ?? {};

const PUBLISHABLE_KEY: string = cfg.clerkPublishableKey ?? '';
const API_BASE: string = (cfg.apiBaseUrl ?? '').replace(/\/$/, '');

export class NeonClerkBackend implements Backend {
  // deno-lint-ignore no-explicit-any
  private clerk: any = null;
  private listeners: Array<() => void> = [];
  private loaded = false;

  async init(): Promise<void> {
    if (!PUBLISHABLE_KEY) {
      console.warn('[backend] No Clerk publishable key configured — running signed out.');
      return;
    }

    try {
      this.clerk = new Clerk(PUBLISHABLE_KEY);
      await this.clerk.load({});
      this.loaded = true;

      // Fires on sign-in, sign-out, and session refresh.
      this.clerk.addListener(() => {
        for (const cb of this.listeners) cb();
      });
    } catch (e) {
      // Offline or Clerk unreachable. Cached entitlements carry the session.
      console.warn('[backend] Clerk unavailable — continuing with cached state.', e);
      this.loaded = false;
    }
  }

  currentUser(): BackendUser | null {
    const u = this.loaded ? this.clerk?.user : null;
    if (!u) return null;
    return {
      id: u.id,
      email: u.primaryEmailAddress?.emailAddress ?? null,
    };
  }

  onAuthChange(cb: () => void): void {
    this.listeners.push(cb);
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    if (!this.loaded) return { error: 'Cannot sign in while offline.' };

    try {
      const attempt = await this.clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === 'complete') {
        await this.clerk.setActive({ session: attempt.createdSessionId });
        return { error: null };
      }

      // Second factor or another step is outstanding. LeptonPad's login modal
      // has no UI for these, so say so plainly rather than failing silently.
      return { error: 'Additional verification is required to sign in.' };
    } catch (e) {
      return { error: clerkError(e) };
    }
  }

  async signUp(
    email: string,
    password: string,
  ): Promise<{ error: string | null; needsVerification?: boolean }> {
    if (!this.loaded) return { error: 'Cannot create an account while offline.' };

    try {
      const attempt = await this.clerk.client.signUp.create({
        emailAddress: email,
        password,
      });

      if (attempt.status === 'complete') {
        await this.clerk.setActive({ session: attempt.createdSessionId });
        return { error: null, needsVerification: false };
      }

      // Clerk requires email verification by default — send the code.
      await attempt.prepareEmailAddressVerification({ strategy: 'email_code' });
      return { error: null, needsVerification: true };
    } catch (e) {
      return { error: clerkError(e) };
    }
  }

  async verifyEmailCode(code: string): Promise<{ error: string | null }> {
    if (!this.loaded) return { error: 'Cannot verify while offline.' };

    try {
      // Clerk keeps the in-flight sign-up on the client, so the code alone
      // finishes it — no need to re-send the email address.
      const attempt = await this.clerk.client.signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === 'complete') {
        await this.clerk.setActive({ session: attempt.createdSessionId });
        return { error: null };
      }
      return { error: 'That code was not accepted. Check it and try again.' };
    } catch (e) {
      return { error: clerkError(e) };
    }
  }

  async signOut(): Promise<void> {
    if (!this.loaded) return;
    try {
      await this.clerk.signOut();
    } catch { /* already gone */ }
  }

  async getMyRole(): Promise<RoleInfo> {
    const data = await this.call<{
      role: string;
      trial_expires_at: string | null;
      pack_ids: string[];
    }>('GET', '/me');

    return {
      role: (data.role as UserRole) ?? 'free',
      trialExpiresAt: data.trial_expires_at ?? null,
      packIds: Array.isArray(data.pack_ids) ? data.pack_ids : [],
    };
  }

  async getPackKey(packId: string): Promise<string | null> {
    try {
      const data = await this.call<{ key: string | null }>(
        'GET',
        `/pack-key?pack_id=${encodeURIComponent(packId)}`,
      );
      return data.key && data.key.length > 0 ? data.key : null;
    } catch {
      return null; // not owned, offline, or API down — caller falls back to cache
    }
  }

  async redeemLicenseCode(code: string): Promise<RedeemResult> {
    try {
      const data = await this.call<{
        success: boolean;
        message: string;
        role?: string;
        pack_id?: string;
      }>('POST', '/redeem', { code });

      return {
        success: data.success ?? false,
        message: data.message ?? 'Unknown response.',
        role: data.role ?? undefined,
        packId: data.pack_id ?? undefined,
      };
    } catch (e) {
      return { success: false, message: (e as Error).message || 'Network error.' };
    }
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  /** Fresh short-lived session JWT. Null when signed out or offline. */
  private async token(): Promise<string | null> {
    if (!this.loaded || !this.clerk?.session) return null;
    try {
      return await this.clerk.session.getToken();
    } catch {
      return null;
    }
  }

  private async call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    if (!API_BASE) throw new Error('No API URL configured.');

    const jwt = await this.token();
    if (!jwt) throw new Error('Not signed in.');

    const res = await fetch(API_BASE + path, {
      method,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed (${res.status}).`);
    }

    return await res.json() as T;
  }
}

/** Clerk surfaces validation problems in an errors[] array; fall back to Error.message. */
function clerkError(e: unknown): string {
  // deno-lint-ignore no-explicit-any
  const err = e as any;
  const first = err?.errors?.[0];
  return first?.longMessage ?? first?.message ?? err?.message ?? 'Authentication failed.';
}
