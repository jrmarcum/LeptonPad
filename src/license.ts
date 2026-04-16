// ---------------------------------------------------------------------------
// license.ts — License code redemption and section-pack access UI
//
// License codes are one-time, uppercase tokens (format XXXX-XXXX-XXXX-XXXX).
// A code grants either:
//   • A role upgrade  (grants_role = 'pro' | 'demo')  — year-based by default
//   • A section pack  (grants_pack_id = <pack slug>)
//
// All validation lives in the Supabase RPC `redeem_license_code`.
// This module handles only the client-side UI and the RPC call.
// ---------------------------------------------------------------------------

import { supabase, currentUser, currentRole, ownedPackIds } from './auth.ts';

export interface RedeemResult {
  success: boolean;
  message: string;
  /** Set when a role was upgraded. */
  role?: string;
  /** Set when a pack was unlocked. */
  packId?: string;
}

/**
 * Redeem a license code for the currently signed-in user.
 * After a successful redemption the caller should call initAuth() or
 * refresh the sidebar to reflect the new role / pack.
 */
export async function redeemLicenseCode(rawCode: string): Promise<RedeemResult> {
  if (!currentUser) {
    return { success: false, message: 'You must be signed in to redeem a code.' };
  }

  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { success: false, message: 'Please enter a code.' };
  }

  try {
    const { data, error } = await supabase.rpc('redeem_license_code', { p_code: code });
    if (error) return { success: false, message: error.message };

    return {
      success: data?.success ?? false,
      message: data?.message ?? 'Unknown response.',
      role:    data?.role    ?? undefined,
      packId:  data?.pack_id ?? undefined,
    };
  } catch (e) {
    return { success: false, message: (e as Error).message ?? 'Network error.' };
  }
}

/**
 * Show the redeem-code modal dialog.
 * Resolves with the redemption result (or null if cancelled).
 */
export function showRedeemCodeDialog(): Promise<RedeemResult | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'import-modal-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'import-modal';

    const title = document.createElement('h3');
    title.textContent = 'Redeem License Code';
    dialog.appendChild(title);

    const sub = document.createElement('p');
    sub.className = 'import-modal-sub';
    sub.textContent = 'Enter your purchase code to activate Pro access or unlock a template pack.';
    dialog.appendChild(sub);

    const input = document.createElement('input');
    input.type        = 'text';
    input.placeholder = 'XXXX-XXXX-XXXX-XXXX';
    input.className   = 'license-code-input';
    input.maxLength   = 24;
    input.style.cssText = 'width:100%;margin:0.75rem 0 0.25rem;padding:0.5rem 0.6rem;' +
                          'font-size:1rem;letter-spacing:0.1em;text-transform:uppercase;' +
                          'border:1px solid var(--border);border-radius:4px;' +
                          'background:var(--bg-input,#fff);color:var(--text);';
    dialog.appendChild(input);

    const errorEl = document.createElement('p');
    errorEl.style.cssText = 'color:#e55;font-size:0.8rem;min-height:1.2em;margin:0.2rem 0 0.6rem;';
    dialog.appendChild(errorEl);

    const btns = document.createElement('div');
    btns.className = 'import-modal-btns';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => { overlay.remove(); resolve(null); });
    btns.appendChild(cancelBtn);

    const redeemBtn = document.createElement('button');
    redeemBtn.className   = 'import-confirm-btn';
    redeemBtn.textContent = 'Redeem';
    redeemBtn.addEventListener('click', async () => {
      redeemBtn.disabled  = true;
      redeemBtn.textContent = 'Checking…';
      errorEl.textContent   = '';

      const result = await redeemLicenseCode(input.value);

      if (result.success) {
        overlay.remove();
        resolve(result);
      } else {
        errorEl.textContent   = result.message;
        redeemBtn.disabled    = false;
        redeemBtn.textContent = 'Redeem';
        input.focus();
      }
    });
    btns.appendChild(redeemBtn);

    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Allow Enter to submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') redeemBtn.click();
      if (e.key === 'Escape') { overlay.remove(); resolve(null); }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { overlay.remove(); resolve(null); }
    });

    setTimeout(() => input.focus(), 50);
  });
}

/**
 * Returns a display string summarising what the user currently has access to.
 * Used in the sidebar info panel.
 */
export function accessSummary(): string {
  if (currentRole === 'super') return 'Full access (super)';
  if (currentRole === 'pro')   return 'Pro — all features';
  if (currentRole === 'demo')  return 'Demo trial active';
  if (ownedPackIds.size > 0)   return `${ownedPackIds.size} template pack(s)`;
  return 'Free — no packs';
}
