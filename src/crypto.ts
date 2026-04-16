// ---------------------------------------------------------------------------
// crypto.ts — AES-256-GCM helpers for purchased section template protection
//
// Key lifecycle:
//   1. A per-pack key is derived server-side (Supabase RPC get_pack_key) and
//      returned as 32 raw bytes, base64-encoded.
//   2. The client imports those bytes as a non-extractable CryptoKey.
//   3. Encryption: called once when a super/admin creates a distributable
//      template pack. The IV and ciphertext are stored in the section_packs DB
//      record and embedded in the distributed JSON templates.
//   4. Decryption: called at project-load time when a block has encrypted: true.
//      The decrypted content lives only in memory and is never written to disk.
// ---------------------------------------------------------------------------

/** Base64-encode a Uint8Array (browser-safe). */
function b64Encode(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

/** Base64-decode to a plain Uint8Array backed by a concrete ArrayBuffer. */
function b64Decode(s: string): Uint8Array {
  const binary = atob(s);
  const buf    = new ArrayBuffer(binary.length);
  const bytes  = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Import raw key bytes (base64) as a non-extractable AES-256-GCM CryptoKey.
 * The key is derived server-side and must be exactly 32 bytes.
 */
export async function importPackKey(base64Key: string): Promise<CryptoKey> {
  const raw = b64Decode(base64Key);
  // Cast to ArrayBuffer satisfies the SubtleCrypto overload (avoids SharedArrayBuffer ambiguity)
  return await crypto.subtle.importKey(
    'raw',
    raw.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,          // non-extractable
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt a plaintext string with an AES-256-GCM CryptoKey.
 * Returns { iv, ciphertext } — both base64-encoded strings suitable for JSON storage.
 */
export async function encryptTemplate(
  plaintext: string,
  key: CryptoKey,
): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return {
    iv:         b64Encode(iv),
    ciphertext: b64Encode(new Uint8Array(encrypted)),
  };
}

/**
 * Decrypt a base64-encoded ciphertext back to a string.
 * Returns null if decryption fails (wrong key, tampered data, etc.).
 */
export async function decryptTemplate(
  iv: string,
  ciphertext: string,
  key: CryptoKey,
): Promise<string | null> {
  try {
    const ivBytes = b64Decode(iv);
    const ctBytes = b64Decode(ciphertext);
    // deno-lint-ignore no-explicit-any
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes as any }, key, ctBytes as any);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}
