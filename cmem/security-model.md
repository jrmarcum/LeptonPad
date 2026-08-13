# Security Model

The thing being protected is **purchased section-template content**. Everything else in LeptonPad is
the user's own data, held client-side.

## The invariant (do not change this)

> **Decrypted template content is NEVER written back to the project JSON. Only `encContent`
> (ciphertext) and `encIv` are serialized.**

This is a deliberate boundary: **copying a project file must not grant template access.** The key is
tied to the buyer's account, so a shared `.json` carries ciphertext the recipient cannot open.

How it holds in code (`src/persistence.ts`):

- `loadProject()` — for a block with `encrypted && packId && encIv && encContent`, fetch the pack key,
  `decryptTemplate()`, assign `block.content`, and set `block.encrypted = false` **in memory**. The
  `encIv`/`encContent` fields are **retained on the block**.
- `serializeProject()` — the write path keys off `b.packId && b.encIv && b.encContent`, **not** off
  `b.encrypted`. It re-emits `encrypted: true` plus the retained ciphertext. That is why flipping the
  in-memory flag is safe: the serializer never consults it.

⚠️ **If you ever make the serializer trust `block.encrypted`, plaintext templates will leak into saved
files.** The two flags exist for different purposes — `encrypted` is a render-time signal, the
`encIv`/`encContent` pair is the storage truth.

## Where the boundary is

Under the retired Supabase stack, RLS plus `auth.uid()` inside a `security definer` function was the
boundary. It is not any more. **The API is the boundary:**

> **The user id comes from the verified Clerk JWT and from nowhere else.** Never from a query string,
> a request body, or a header. Every database function takes it as its first argument, so a client
> that could choose its own id would own every pack in the system.

Do not add a code path to `api/main.ts` that accepts a user id. That single rule replaces every RLS
policy that was deleted. Supporting measures in the same file:

- **CORS is an exact-origin allowlist** (`ALLOWED_ORIGINS`). A wildcard would let any site spend a
  signed-in user's session.
- **Database errors are never returned verbatim** — they leak schema detail. The client gets
  `Server error.`; the detail goes to the Deno Deploy log.
- **Startup refuses a malformed `CLERK_JWT_KEY`.** Pasting a `pk_`/`sk_` token where the PEM public
  key belongs would otherwise start cleanly and then 401 every request forever — a silent outage that
  reads as a client bug. Hit for real on 2026-08-13.

## Key derivation

```
key = HMAC-SHA256( key = pack_secrets.secret , message = clerk_user_id )  →  32 bytes → base64
```

Computed **server-side** in `get_pack_key()`, after an ownership check that also honours
`expires_at`. `pack_secrets` is reachable only by the API's database role; no client connects to
Postgres at all.

⚠️ **This formula is frozen.** Change it, or change what feeds `p_user_id`, and every template already
encrypted under the old key becomes permanently unreadable. It was free to change during the
migration because nothing was live. It is not free again.

Client side (`src/crypto.ts`):

- `importPackKey(base64)` → `crypto.subtle.importKey('raw', …, {name:'AES-GCM', length:256}, false,
  ['encrypt','decrypt'])`. **`false` = non-extractable** — the key material cannot be read back out of
  the `CryptoKey`.
- `encryptTemplate()` — fresh **12-byte random IV per encryption** (`crypto.getRandomValues`),
  AES-GCM, returns base64 `{iv, ciphertext}`. Called only when a super user builds a distributable
  pack.
- `decryptTemplate()` — returns **`null` on any failure** (wrong key, tampered data, GCM tag
  mismatch). Callers must treat `null` as "not available," never as empty content.

Properties this gives: per-user keys (one user's leaked key opens nothing for another), authenticated
encryption (GCM detects tampering), and no key material in the project file.

## Who can become `super` (verified 2026-08-13)

**No user can escalate through the app, and the database is what guarantees it** — not application
logic, which is why the guarantee is worth relying on:

| Attempted escalation              | Result                                                                      |
| --------------------------------- | --------------------------------------------------------------------------- |
| License code granting `super`     | **Blocked** — `CHECK (grants_role = ANY ('pro','demo'))` on `license_codes` |
| Code granting a role _and_ a pack | **Blocked** — the `one_grant` CHECK                                         |
| Writing an unknown role value     | **Blocked** — `CHECK (role in ('super','pro','demo','free'))`               |

`redeem_license_code` is the **only** path in `api/main.ts` that writes to `user_roles`, and it can
only ever write what a code carries. A super-granting code cannot be created even deliberately.

**But `super` is gated by infrastructure access, not identity.** Anyone holding `DATABASE_URL` can
grant it directly in Postgres. That credential lives in exactly three places, and protecting `super`
means protecting these:

1. `.env.api` on the owner's machine (gitignored)
2. the Neon account login
3. the Deno Deploy dashboard environment variables

Rotating the Neon password is the lever if any of the three is exposed.

⚠️ **No audit trail on role changes.** Nothing records who granted a role or when. Acceptable for a
single-operator product; a `granted_by` / `granted_at` pair on `user_roles` would close it cheaply if
that ever stops being true.

## Accepted weaknesses — recorded deliberately, not oversights

1. **Section-creation gating is client-side.** `canCreateSection()` and the `_showProRequiredDialog()`
   path in `main.ts` are UI. A determined user can edit the bundle or hand-craft project JSON and
   create a blank section block. **The real boundary is `get_pack_key`** — you can draw an empty
   section, you cannot obtain purchased content. Correct place to draw the line for a client-side app,
   but do not describe blank-section creation as "secured."
2. **Pack keys are cached in `localStorage` (`lp_pk_<packId>`) and survive logout.** Anyone with
   access to the device profile can read the base64 key and decrypt that user's pack content offline.
   Accepted so offline use and logout/re-login keep working. If it ever needs tightening, the move is
   a session-scoped `IndexedDB` store with a non-extractable key, not deleting the cache — the
   offline requirement is real.
3. **`localStorage` is readable by any script on the origin.** There is no third-party script tag on
   the page (Clerk is bundled, not CDN-loaded), and that is the whole mitigation: **do not add a CDN
   script tag to `public/index.html`.**
4. **The Clerk publishable key is public by design.** It identifies the Clerk instance and grants
   nothing on its own; it is safe in `dist/config.js`.

## Review checklist for changes in this area

- [ ] Does `serializeProject()` still write ciphertext only? Save a project containing an owned pack
      block and **grep the saved file for a known plaintext string**.
- [ ] Does `decryptTemplate()`'s `null` still propagate as "unavailable" rather than empty?
- [ ] Any new API route: does it take the user id from the verified JWT and nowhere else?
- [ ] Any new database function: does it take `p_user_id` as a parameter rather than trusting input?
- [ ] Did anything new get written to `localStorage`? If it is secret-adjacent, say so here.
- [ ] `deno task db:check` still 10/10.
