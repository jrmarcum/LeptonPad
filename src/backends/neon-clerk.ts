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

// Read LAZILY, not captured at import time.
//
// `/config.js` sets `globalThis.__LP_CONFIG__`, and these used to be module-level `const`s
// evaluated the moment this module was imported. That works today only because index.html loads
// config.js as a classic script before the deferred module bundle, AND because the bundler
// inlines the dynamic import of this file. Change either — make config.js `defer`/`async`, or
// have the bundler emit a real chunk — and both constants silently become '', which boots the
// app permanently signed out behind one console warning, with every Pro gate reading as "Free".
// A function call costs nothing here and removes the ordering dependency entirely.
// main.ts already reads the same global lazily.
// deno-lint-ignore no-explicit-any
const cfg = (): any => (globalThis as any).__LP_CONFIG__ ?? {};

const publishableKey = (): string => cfg().clerkPublishableKey ?? '';
const apiBase = (): string => (cfg().apiBaseUrl ?? '').replace(/\/$/, '');

export class NeonClerkBackend implements Backend {
  // deno-lint-ignore no-explicit-any
  private clerk: any = null;
  private listeners: Array<() => void> = [];
  private loaded = false;
  /** The MFA strategy chosen during signIn(), needed again to attempt the code. */
  private secondFactorStrategy: string | null = null;

  async init(): Promise<void> {
    if (!publishableKey()) {
      console.warn('[backend] No Clerk publishable key configured — running signed out.');
      return;
    }

    try {
      this.clerk = new Clerk(publishableKey());
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

  async signIn(email: string, password: string): Promise<{
    error: string | null;
    needsSecondFactor?: boolean;
    secondFactorLabel?: string;
  }> {
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

      const status = attempt?.status ?? 'unknown';
      // deno-lint-ignore no-explicit-any
      const strat = (fs: any[]) => (fs ?? []).map((f: any) => f?.strategy).filter(Boolean);
      const first = strat(attempt?.supportedFirstFactors);
      const second = strat(attempt?.supportedSecondFactors);

      // MFA: the password was accepted and Clerk wants a second factor.
      if (status === 'needs_second_factor' && second.length) {
        // Prefer a strategy the user does not have to switch devices for, then whatever is
        // offered. `totp` and `backup_code` are entered from something the user already has and
        // take NO prepare step; `email_code`/`phone_code` must be sent first.
        const pick = ['totp', 'email_code', 'phone_code', 'backup_code']
          .find((s) => second.includes(s)) ?? second[0];
        this.secondFactorStrategy = pick;
        try {
          if (pick === 'email_code' || pick === 'phone_code') {
            await this.clerk.client.signIn.prepareSecondFactor({ strategy: pick });
          }
        } catch (e) {
          return { error: clerkError(e) };
        }
        return {
          error: null,
          needsSecondFactor: true,
          secondFactorLabel: pick === 'email_code'
            ? 'your email'
            : pick === 'phone_code'
            ? 'your phone'
            : pick === 'backup_code'
            ? 'your backup codes'
            : 'your authenticator app',
        };
      }

      // Anything else — an email code as the FIRST factor, or a forced password reset. The modal
      // cannot perform those, so name the step instead of the flat "Additional verification is
      // required" this used to return, which threw away the one fact needed to act on it.
      console.warn('[auth] sign-in incomplete', { status, first, second });
      const detail = [
        first.length ? `first factor: ${first.join(', ')}` : '',
        second.length ? `second factor: ${second.join(', ')}` : '',
      ].filter(Boolean).join('; ');
      return {
        error: `Sign-in needs another step that this app cannot show (${status}` +
          `${detail ? ' — ' + detail : ''}). See the browser console for detail.`,
      };
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

  /**
   * Finish an MFA sign-in. `totp` and `backup_code` are verified directly; `email_code` and
   * `phone_code` were already prepared (sent) by signIn(), so this only attempts them.
   */
  async verifySecondFactor(code: string): Promise<{ error: string | null }> {
    if (!this.loaded) return { error: 'Cannot sign in while offline.' };
    const strategy = this.secondFactorStrategy;
    if (!strategy) return { error: 'No verification is in progress. Start signing in again.' };

    try {
      const attempt = await this.clerk.client.signIn.attemptSecondFactor({ strategy, code });
      if (attempt.status === 'complete') {
        await this.clerk.setActive({ session: attempt.createdSessionId });
        this.secondFactorStrategy = null;
        return { error: null };
      }
      return { error: 'That code was not accepted. Check it and try again.' };
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
    if (!apiBase()) throw new Error('No API URL configured.');

    const jwt = await this.token();
    if (!jwt) throw new Error('Not signed in.');

    const res = await fetch(apiBase() + path, {
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
