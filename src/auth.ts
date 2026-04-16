// ---------------------------------------------------------------------------
// auth.ts — Supabase authentication, user roles, pack ownership, offline cache
//
// Offline-first design:
//   • Supabase stores the JWT in localStorage automatically — valid offline.
//   • After a successful online sync, role + owned pack IDs are also cached
//     in localStorage so that the app works without a network connection.
//   • Pack decryption keys are cached separately (lp_pk_<packId>) after the
//     first online fetch so encrypted templates render while offline.
// ---------------------------------------------------------------------------

import { createClient, type Session, type User } from '@supabase/supabase-js';
import { importPackKey } from './crypto.ts';
import type { UserRole } from './types.ts';

// ---------------------------------------------------------------------------
// Supabase client — credentials come from window.__LP_CONFIG__ (config.js)
// ---------------------------------------------------------------------------
// deno-lint-ignore no-explicit-any
const cfg = (globalThis as any).__LP_CONFIG__ ?? { supabaseUrl: '', supabaseAnonKey: '' };

export const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
  auth: {
    persistSession:    true,   // stores JWT in localStorage
    autoRefreshToken:  true,
    detectSessionInUrl: false,
  },
});

// ---------------------------------------------------------------------------
// Exported auth state (read-only externally — mutated only inside this module)
// ---------------------------------------------------------------------------
export let currentUser: User | null = null;
export let currentRole: UserRole    = 'free';
export let ownedPackIds: Set<string> = new Set();

// localStorage keys
const LS_ROLE   = 'lp_role';
const LS_PACKS  = 'lp_packs';
const LS_PK_PFX = 'lp_pk_';

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
    pro:   'Pro',
    demo:  'Demo',
    free:  'Free',
  };
  return labels[currentRole];
}

// ---------------------------------------------------------------------------
// Initialise — call once at app start, before the first user interaction
// ---------------------------------------------------------------------------

/**
 * Restores session from localStorage (works offline) and, if online,
 * syncs the role and pack list from Supabase.
 */
export async function initAuth(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await _applySession(session);
  } else {
    _restoreFromCache();
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      await _applySession(session);
    } else {
      _clearSession();
    }
    _notifyListeners();
  });
}

// ---------------------------------------------------------------------------
// Login / signup / logout
// ---------------------------------------------------------------------------

export async function login(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signup(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  // If email confirmation is disabled in the Supabase project, the user is
  // immediately signed in; otherwise they'll get a confirmation email.
  if (!data.session) {
    return { error: null }; // show "check your email" message
  }
  return { error: null };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  _clearSession();
  _notifyListeners();
}

// ---------------------------------------------------------------------------
// Pack key (decryption key for purchased section templates)
// ---------------------------------------------------------------------------

/**
 * Returns a CryptoKey for the given pack.
 * Tries the server first; falls back to the locally-cached key material.
 * Returns null if the user doesn't own the pack and no cache exists.
 */
export async function getPackKey(packId: string): Promise<CryptoKey | null> {
  const cacheKey = LS_PK_PFX + packId;

  // Try to fetch from server (requires network + valid session)
  try {
    const { data, error } = await supabase.rpc('get_pack_key', { p_pack_id: packId });
    if (!error && typeof data === 'string' && data.length > 0) {
      localStorage.setItem(cacheKey, data); // cache for offline
      return importPackKey(data);
    }
  } catch { /* offline or network error — fall through */ }

  // Fall back to cached key material
  const cached = localStorage.getItem(cacheKey);
  if (cached) return importPackKey(cached);

  return null;
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

async function _applySession(session: Session): Promise<void> {
  currentUser = session.user;

  try {
    // RPC returns { role, trial_expires_at, pack_ids }
    const { data, error } = await supabase.rpc('get_my_role');
    if (error) throw error;

    currentRole  = (data?.role as UserRole) ?? 'free';
    ownedPackIds = new Set<string>(
      Array.isArray(data?.pack_ids) ? (data.pack_ids as string[]) : [],
    );

    // Cache for offline use
    localStorage.setItem(LS_ROLE,  currentRole);
    localStorage.setItem(LS_PACKS, JSON.stringify([...ownedPackIds]));
  } catch {
    // Network unavailable — restore from cache
    _restoreFromCache();
  }
}

function _restoreFromCache(): void {
  currentRole  = (localStorage.getItem(LS_ROLE) as UserRole | null) ?? 'free';
  try {
    const raw = JSON.parse(localStorage.getItem(LS_PACKS) ?? '[]');
    ownedPackIds = new Set(Array.isArray(raw) ? (raw as string[]) : []);
  } catch {
    ownedPackIds = new Set();
  }
  // currentUser may still be set via Supabase's own localStorage session
  // — that's fine; we just don't have a fresh role from the server.
}

function _clearSession(): void {
  currentUser  = null;
  currentRole  = 'free';
  ownedPackIds = new Set();
  localStorage.removeItem(LS_ROLE);
  localStorage.removeItem(LS_PACKS);
  // Note: pack key caches (lp_pk_*) are intentionally kept so the user's
  // own projects still render after a logout + re-login on the same device.
}
