// ---------------------------------------------------------------------------
// auth.ts — user identity, roles, pack ownership, offline cache.
//
// This module owns LeptonPad's view of "who is signed in and what may they do".
// It talks to no vendor directly: every call goes through the Backend interface
// (backend.ts), so swapping providers touches src/backends/ and nothing else.
//
// Offline-first design:
//   • The provider persists its own session, so a signed-in user stays signed in
//     across restarts and offline.
//   • After a successful online sync, role + owned pack ids are cached in
//     localStorage so gating still works with no network.
//   • Pack decryption keys are cached separately (lp_pk_<packId>) so encrypted
//     templates still render offline.
// ---------------------------------------------------------------------------

import { type Backend, type BackendUser, getBackend } from './backend.ts';
import { importPackKey } from './crypto.ts';
import type { UserRole } from './types.ts';

// ---------------------------------------------------------------------------
// Exported auth state (read-only externally — mutated only inside this module)
// ---------------------------------------------------------------------------
export let currentUser: BackendUser | null = null;
export let currentRole: UserRole = 'free';
export let ownedPackIds: Set<string> = new Set();

/**
 * True when the last entitlement sync FAILED and we are running on cached data.
 *
 * This exists because "the server says you are free" and "I could not reach the
 * server" are completely different facts that used to look identical on screen.
 * A paying customer with a dropped connection would silently see "Free — no
 * packs" and watch their purchased sections disappear. Anything that renders a
 * role must check this and say so.
 */
export let entitlementsStale = false;

/** Epoch ms of the last successful sync, or null if one has never succeeded. */
export let lastSyncedAt: number | null = null;

// localStorage keys
const LS_ROLE = 'lp_role';
const LS_PACKS = 'lp_packs';
const LS_SYNCED = 'lp_synced_at';
const LS_PK_PFX = 'lp_pk_';

let backend: Backend | null = null;

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

/** Returns true for roles that can create blank section blocks. */
export function canCreateSection(): boolean {
  return currentRole === 'super' || currentRole === 'pro' || currentRole === 'demo';
}

/** Returns true if the user owns a section pack (or is super). */
export function hasPack(packId: string): boolean {
  return currentRole === 'super' || ownedPackIds.has(packId);
}

/** Display string for the current role. */
export function roleLabel(): string {
  const labels: Record<UserRole, string> = {
    super: 'Super',
    pro: 'Pro',
    demo: 'Demo',
    free: 'Free',
  };
  return labels[currentRole];
}

// ---------------------------------------------------------------------------
// Initialise — call once at app start, before the first user interaction
// ---------------------------------------------------------------------------

/**
 * Restores the session (works offline) and, if online, syncs role and packs
 * from the server.
 */
export async function initAuth(): Promise<void> {
  backend = await getBackend();
  await backend.init();

  currentUser = backend.currentUser();
  if (currentUser) {
    await _syncEntitlements();
  } else {
    _restoreFromCache();
  }

  backend.onAuthChange(async () => {
    currentUser = backend!.currentUser();
    if (currentUser) {
      await _syncEntitlements();
    } else {
      _clearSession();
    }
    _notifyListeners();
  });

  // Recover on our own when the connection comes back, so a user who was
  // offline does not have to reload to get their real access restored.
  globalThis.addEventListener('online', () => {
    if (currentUser && entitlementsStale) void refreshEntitlements();
  });
}

// ---------------------------------------------------------------------------
// Login / signup / logout
// ---------------------------------------------------------------------------

export async function login(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const b = backend ?? (backend = await getBackend());
  return await b.signIn(email, password);
}

export async function signup(
  email: string,
  password: string,
): Promise<{ error: string | null; needsVerification?: boolean }> {
  const b = backend ?? (backend = await getBackend());
  return await b.signUp(email, password);
}

/**
 * Finish a sign-up that returned `needsVerification` by submitting the emailed
 * code. On success the user is signed in.
 */
export async function verifyEmailCode(code: string): Promise<{ error: string | null }> {
  const b = backend ?? (backend = await getBackend());
  if (!b.verifyEmailCode) {
    return { error: 'Check your email for a confirmation link, then sign in.' };
  }
  return await b.verifyEmailCode(code);
}

export async function logout(): Promise<void> {
  const b = backend ?? (backend = await getBackend());
  await b.signOut();
  _clearSession();
  _notifyListeners();
}

// ---------------------------------------------------------------------------
// Pack key (decryption key for purchased section templates)
// ---------------------------------------------------------------------------

/**
 * Returns key material for the given pack as a base64 string.
 * Tries the server first; falls back to the locally-cached key.
 * Returns null if the user doesn't own the pack and no cache exists.
 */
export async function getPackKeyMaterial(packId: string): Promise<string | null> {
  const cacheKey = LS_PK_PFX + packId;

  try {
    const b = backend ?? (backend = await getBackend());
    const key = await b.getPackKey(packId);
    if (key) {
      localStorage.setItem(cacheKey, key); // cache for offline
      return key;
    }
  } catch { /* offline or network error — fall through to cache */ }

  return localStorage.getItem(cacheKey);
}

/** Returns an importable CryptoKey for the pack, or null. */
export async function getPackKey(packId: string): Promise<CryptoKey | null> {
  const material = await getPackKeyMaterial(packId);
  return material ? await importPackKey(material) : null;
}

// ---------------------------------------------------------------------------
// License codes
// ---------------------------------------------------------------------------

export async function redeemCode(code: string) {
  const b = backend ?? (backend = await getBackend());
  return await b.redeemLicenseCode(code);
}

/** Re-pull role and packs after a successful redemption. */
export async function refreshEntitlements(): Promise<void> {
  await _syncEntitlements();
  _notifyListeners();
}

// ---------------------------------------------------------------------------
// Auth change listeners (used by sidebar to re-render login state)
// ---------------------------------------------------------------------------
type AuthListener = () => void;
const _listeners: AuthListener[] = [];

export function onAuthChange(cb: AuthListener): void {
  _listeners.push(cb);
}

function _notifyListeners(): void {
  for (const cb of _listeners) cb();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function _syncEntitlements(): Promise<void> {
  try {
    const info = await backend!.getMyRole();
    currentRole = info.role ?? 'free';
    ownedPackIds = new Set(info.packIds ?? []);

    entitlementsStale = false;
    lastSyncedAt = Date.now();

    localStorage.setItem(LS_ROLE, currentRole);
    localStorage.setItem(LS_PACKS, JSON.stringify([...ownedPackIds]));
    localStorage.setItem(LS_SYNCED, String(lastSyncedAt));
  } catch {
    // Server unreachable. Fall back to cache so the user keeps working — but
    // mark the state stale so the UI can say so rather than implying the server
    // demoted them.
    entitlementsStale = true;
    _restoreFromCache();
  }
}

function _restoreFromCache(): void {
  currentRole = (localStorage.getItem(LS_ROLE) as UserRole | null) ?? 'free';
  try {
    const raw = JSON.parse(localStorage.getItem(LS_PACKS) ?? '[]');
    ownedPackIds = new Set(Array.isArray(raw) ? (raw as string[]) : []);
  } catch {
    ownedPackIds = new Set();
  }
  const synced = Number(localStorage.getItem(LS_SYNCED));
  lastSyncedAt = Number.isFinite(synced) && synced > 0 ? synced : null;
}

/**
 * True when we are showing `free` only because we have never managed to reach
 * the server — as opposed to the server actually saying so. Worth distinguishing
 * in the UI: the first is "unknown", the second is a fact.
 */
export function accessUnverified(): boolean {
  return entitlementsStale && lastSyncedAt === null;
}

/** "2 minutes ago" / "3 days ago" — for showing how stale cached access is. */
export function lastSyncedLabel(): string | null {
  if (lastSyncedAt === null) return null;
  const secs = Math.max(0, Math.round((Date.now() - lastSyncedAt) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function _clearSession(): void {
  currentUser = null;
  currentRole = 'free';
  ownedPackIds = new Set();
  entitlementsStale = false; // signed out is a fact, not a failure to reach the server
  lastSyncedAt = null;
  localStorage.removeItem(LS_ROLE);
  localStorage.removeItem(LS_PACKS);
  localStorage.removeItem(LS_SYNCED);
  // Pack key caches (lp_pk_*) are intentionally kept so the user's own projects
  // still render after a logout + re-login on the same device.
  // See cmem/security-model.md — this is an accepted tradeoff, not an oversight.
}
