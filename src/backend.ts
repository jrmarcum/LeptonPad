// ---------------------------------------------------------------------------
// backend.ts — the provider-agnostic backend contract
//
// Every network call LeptonPad makes goes through this interface. Nothing else
// in src/ may import a vendor SDK directly. That rule is what makes the backend
// swappable: the whole surface is eight methods over two concerns —
//
//   identity   : init / currentUser / onAuthChange / signIn / signUp / signOut
//   entitlement: getMyRole / getPackKey / redeemLicenseCode
//
// Implementations live in src/backends/. There is one today — Neon + Clerk —
// but the seam stays: it is what made the 2026-08-13 move off Supabase a
// contained change rather than a refactor, and the next provider change will be
// the same shape.
//
// See cmem/backend-migration.md for why this exists.
// ---------------------------------------------------------------------------

import type { UserRole } from './types.ts';

/** The minimum LeptonPad needs to know about a signed-in person. */
export interface BackendUser {
  id: string;
  email: string | null;
}

/** Result of an entitlement lookup. Shapes the sidebar and every pro gate. */
export interface RoleInfo {
  role: UserRole;
  trialExpiresAt: string | null;
  packIds: string[];
}

/** Result of redeeming a license code. `message` is shown to the user verbatim. */
export interface RedeemResult {
  success: boolean;
  message: string;
  role?: string;
  packId?: string;
}

export interface Backend {
  /** Restore any persisted session. Called once, before the first user event. */
  init(): Promise<void>;

  /** The signed-in user, or null. Synchronous — read after init() resolves. */
  currentUser(): BackendUser | null;

  /** Register a callback fired on sign-in, sign-out, and session refresh. */
  onAuthChange(cb: () => void): void;

  signIn(email: string, password: string): Promise<{ error: string | null }>;

  /**
   * Create an account. `needsVerification` is true when the provider sent a
   * confirmation email and the user is not yet signed in.
   */
  signUp(
    email: string,
    password: string,
  ): Promise<{ error: string | null; needsVerification?: boolean }>;

  /**
   * Complete a sign-up that returned `needsVerification` by submitting the
   * emailed code. Optional: providers that verify by clicking a link instead of
   * entering a code do not implement it.
   */
  verifyEmailCode?(code: string): Promise<{ error: string | null }>;

  signOut(): Promise<void>;

  /**
   * The caller's effective role and owned packs. Expiry is applied server-side —
   * never trust a client clock for entitlement.
   */
  getMyRole(): Promise<RoleInfo>;

  /**
   * Base64 key material for a purchased pack, or null when the caller does not
   * own it. The key is derived server-side and is unique per (user, pack).
   */
  getPackKey(packId: string): Promise<string | null>;

  redeemLicenseCode(code: string): Promise<RedeemResult>;
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

let _backend: Backend | null = null;

/**
 * Returns the singleton backend. Async because adding a second implementation
 * means branching here on a config value and dynamically importing it — keeping
 * the signature stable now avoids touching every call site then.
 */
export async function getBackend(): Promise<Backend> {
  if (_backend) return _backend;

  const { NeonClerkBackend } = await import('./backends/neon-clerk.ts');
  _backend = new NeonClerkBackend();

  return _backend;
}
