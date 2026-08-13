# Backend Migration — Supabase → Neon + Clerk + Deno Deploy

Decided, implemented, and completed on **2026-08-13** — including the teardown: the Supabase backend,
schema, and dependency were all deleted the same day, and every other `cmem/` file was rewritten to
the migrated state. This file is the record of what changed and why.

## Why

Supabase's free tier **pauses a project after 1 week of inactivity**, which during development —
where weeks pass without touching the backend — meant repeatedly restoring a paused project or
paying $25/mo for a product with no users yet. The brief was: free during development, willing to pay
for a managed service at launch.

The survey (published rates, retrieved 2026-08-13) produced two findings that decided it:

1. **Appwrite Cloud and Nhost pause free projects after 1 week too.** Migrating to either would have
   been pure motion — the same behaviour, after doing the work.
2. **Neon's free plan is permanent** (no credit card, 100 projects) and **Clerk's free tier does not
   pause** (50,000 monthly retained users). Neither has an inactivity cliff.

Launch cost: roughly **$3.36/mo** (Neon Launch usage-based, Clerk free under 50k MRU, Deno Deploy
free under 1M requests) against **$25/mo** flat for Supabase Pro — about $260/year.

The full comparison, with per-vendor limits and the load calculation, is the published sheet
_What Replaces Supabase?_ Re-verify vendor pricing before quoting it; it moves.

## The shape now

| Concern                             | Owner                               | Notes                                                              |
| ----------------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| Accounts, passwords, sessions, JWTs | **Clerk**                           | Never sees a pack or a role.                                       |
| Entitlement API                     | **Deno Deploy** (`api/main.ts`)     | Verifies the Clerk JWT, calls Neon.                                |
| Tables and functions                | **Neon Postgres** (`db/schema.sql`) | Same 5 tables, same 3 entitlement functions, plus 2 admin helpers. |

```
browser ──Clerk SDK──▶ Clerk           (sign in → session JWT)
   │
   └──fetch + Bearer JWT──▶ Deno Deploy API ──SQL──▶ Neon Postgres
                             verifies JWT,
                             passes the verified
                             user id to every function
```

## What changed in the code

**New: `src/backend.ts`** — a nine-method interface over two concerns: identity (`init`,
`currentUser`, `onAuthChange`, `signIn`, `signUp`, `verifyEmailCode`, `signOut`) and entitlement
(`getMyRole`, `getPackKey`, `redeemLicenseCode`). Nothing else in `src/` may import a vendor SDK, and
`getBackend()` returns the singleton. **This seam is why the migration touched two files instead of
the whole app** — keep it even with one implementation.

**New: `src/backends/neon-clerk.ts`** — the one implementation. A `supabase.ts` sibling existed for a
few hours as a config-selectable fallback, so a bad swap could be reverted without a rollback; it was
deleted once the migration was proven.

**New: `db/schema.sql`** — the Neon schema, replacing the deleted `supabase/schema.sql`. Three
structural differences:

- **No `auth.users`.** `user_id` is `text` holding a Clerk id (`user_2abc…`), not a UUID with a
  foreign key.
- **Functions take `p_user_id` instead of calling `auth.uid()`.** The caller is trusted to pass a
  verified id.
- **No RLS policies**, because no client connects to Postgres. The API is the boundary.

**New: `api/main.ts`** — three endpoints mirroring the three RPCs: `GET /me`, `GET /pack-key`,
`POST /redeem`, plus an unauthenticated `GET /health`. Clerk JWT verification is networkless when
`CLERK_JWT_KEY` (the PEM public key) is set — no outbound call per request.

**Rewritten: `src/auth.ts`** — same export surface (`currentUser`, `currentRole`, `ownedPackIds`,
`canCreateSection`, `hasPack`, `roleLabel`, `initAuth`, `login`, `signup`, `logout`, `getPackKey`,
`onAuthChange`), now talking to `Backend` instead of Supabase. `currentUser` is a `BackendUser`
(`{id, email}`) rather than a Supabase `User`. Added `redeemCode` and `refreshEntitlements`.

**Rewritten: `src/license.ts`** — no longer imports a client; calls `redeemCode()` and refreshes
entitlements on success so the sidebar re-renders immediately.

**New: `scripts/write-config.ts`** — one generator for `dist/config.js`, replacing near-identical
copies in `build.ts` and `dev.ts` that could drift.

**Changed: the sign-up flow in `src/main.ts`.** Supabase confirmed email with a **link**, so the old
modal could say "check your email, then sign in" and stop. Clerk confirms with a **6-digit code**,
which would have dead-ended sign-up — account created, no way to finish. The modal now switches into
a confirm-the-code step: email and password fields hide, a one-time-code field appears, and the
submit button becomes "Confirm Email". `Backend.verifyEmailCode()` is optional on the interface
precisely because a link-based provider does not need it.

## The security boundary moved — and this is the thing to get right

Under Supabase, RLS plus `auth.uid()` in a `security definer` function was the boundary. Under
Neon, **the API is the boundary**:

> **The user id comes from the verified Clerk JWT and from nowhere else.** Never from a query string,
> a request body, or a header. Every database function takes it as its first argument, so a client
> that could choose its own id would own every pack in the system.

Do not add a code path to `api/main.ts` that accepts a user id. That single rule replaces every RLS
policy that was deleted.

Also carried over from the API layer:

- **CORS is an exact-origin allowlist** (`ALLOWED_ORIGINS`). A wildcard would let any site spend a
  signed-in user's session.
- **Database errors are never returned verbatim** — they leak schema detail. The client gets
  `Server error.` and the detail goes to the Deno Deploy log.

## Key derivation — unchanged formula, changed input

Still `HMAC-SHA256(pack_secret, user_id)`, still computed in Postgres via pgcrypto, still base64.
What changed is that `user_id` is now a Clerk id rather than a Supabase UUID, **so every key differs
from what the old stack would have produced**.

That was free to change because nothing was live. It is not free again: change the formula or the id
source after a customer owns a pack and their encrypted templates become permanently unreadable.
See [`security-model.md`](security-model.md).

## Bundle size

Three measurements, in order:

| Build            | `dist/main.js` | Why                                                                                         |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------- |
| First cut        | **3.19 MB**    | `@clerk/clerk-js` ships prebuilt UI components                                              |
| Headless build   | **572 KB**     | LeptonPad renders its own login modal, so the components were dead weight                   |
| Supabase removed | **403 KB**     | `deno bundle` inlined both branches of the dynamic import, so the fallback was shipping too |

**The service worker precaches `main.js`**, so this is a number worth re-measuring on any dependency
change — a careless import lands in every user's cache.

## Bugs found by the first end-to-end test (2026-08-13) — both fixed

Running the entitlement chain directly against Neon, before Clerk was wired, caught two defects that
browser testing would have surfaced only as "my customer paid and got nothing."

**1. A pack owner with no `user_roles` row got an empty pack list.** `get_my_role` early-returned
when the role lookup missed, never reaching the `user_packs` aggregation. Ownership lives in a
_separate table_, so a `free` user — who has no role row at all — could own a pack and be told they
owned nothing.

**Root cause: a removed guarantee, not a typo.** Supabase's `handle_new_user` trigger on `auth.users`
inserted a `free` row at signup, so in practice every user had a role row and the early return almost
never fired. Clerk has no equivalent hook. The trigger was deleted during the migration and nothing
replaced the invariant it upheld — so a latent branch became the common path.

**2. `'{}'` produced the JSON string `"{}"`, not an empty array.** In the not-found branch there was
no array context, so `json_build_object` emitted a string. The client survived it
(`Array.isArray()` → false → `[]`), but any other consumer would not. Fixed with
`array[]::text[]`.

Both are now guarded by comments in `db/schema.sql` at the function. The regression check lives in
[`testing.md`](testing.md).

## Where configuration lives — five places, two of them committed

Getting this wrong is how a database password ends up in a public repo. It nearly did on
2026-08-13: a real Neon connection string was pasted into `.env.api.example`, which is a **tracked
template**. It was caught before any commit, so nothing needed rotating — but the trap is live and
the shape is worth memorising.

| Location                 | Committed?    | Holds                                                 | Read by                            |
| ------------------------ | ------------- | ----------------------------------------------------- | ---------------------------------- |
| `.env.api.example`       | ✅ **yes**    | placeholders only                                     | nobody — it is a template          |
| `.env.example`           | ✅ **yes**    | placeholders only                                     | nobody — it is a template          |
| `.env.api`               | ❌ gitignored | `DATABASE_URL`, `CLERK_JWT_KEY` — **real secrets**    | `deno task api:dev`                |
| `.env`                   | ❌ gitignored | `CLERK_PUBLISHABLE_KEY`, `LP_API_URL` — public values | `scripts/write-config.ts` at build |
| **Deno Deploy env vars** | n/a           | the `.env.api` set, for production                    | the deployed `api/main.ts`         |
| **Vercel env vars**      | n/a           | the `.env` set, for production                        | `build.ts` during the Vercel build |

The rule in one line: **`*.example` files are documentation, `.env*` files are configuration, and
production reads neither — it reads dashboard environment variables.**

`.gitignore` enforces this with `.env.*` plus `!` re-includes for the two examples. Verify with
`git check-ignore -q .env.api` after any change to those rules.

⚠️ **Keep the full `?sslmode=require` on the Neon URL.** A truncated `?sslmode=req` is not a valid
libpq mode and fails to connect.

## Status

Done on 2026-08-13:

- [x] Neon project created; `db/schema.sql` applied — 5 tables, 5 functions, `pgcrypto`.
- [x] Clerk application created with email + password.
- [x] `.env` and `.env.api` populated from the committed templates.
- [x] **Owner promoted to `super`.** `deno task promote` with no arguments lists the Clerk accounts
      and their roles; `deno task promote <email> [role]` sets one. It resolves the id through Clerk
      so nobody copies `user_…` strings by hand. The account must exist first — sign up, then
      promote.
- [x] Entitlement chain verified end to end: `deno task db:check`, 10/10.
- [x] Teardown: `src/backends/supabase.ts`, `supabase/schema.sql`, and the `@supabase/supabase-js`
      import all deleted; `THIRD_PARTY_NOTICES.md` rewritten around the components that actually
      ship, which also retired the notice gap in [`licensing.md`](licensing.md).
- [x] **7-day Clerk session lifetime accepted** as a deliberate security posture. Cached role and
      pack keys mean sheets keep opening offline; users re-authenticate weekly to refresh
      entitlements.

Outstanding:

- [ ] **Deploy `api/main.ts` to Deno Deploy** with `DATABASE_URL`, `CLERK_JWT_KEY` (or
      `CLERK_SECRET_KEY`), and `ALLOWED_ORIGINS`; point production `LP_API_URL` at it. Local
      development is fully working; production is not up.
- [ ] Verify the **encryption invariant** in a browser once a real pack exists — the save-and-grep
      check in [`testing.md`](testing.md). The key derivation is proven; the serialize path is not
      yet exercised against a live pack.
