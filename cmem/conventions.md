# Conventions — the rules that were paid for

Every rule here exists because doing the obvious thing produced a bug. Read this before touching CSS,
unit rendering, or imports.

## TypeScript / Deno

**Use `globalThis`, never `window`.** Deno's linter flags `window` as unavailable, and the same source
is bundled for the browser. `globalThis.prompt(...)`, `globalThis.__LP_CONFIG__`,
`globalThis.localStorage`. — [`design-decisions.md`](design-decisions.md)

**Delete unused imports and functions immediately.** Deno treats them as **lint errors, not
warnings** — `deno task check` fails the build. When you refactor imports, remove every one that is
no longer referenced in the same edit.

**Never assign to an imported `export let`.** ES modules forbid it. `state.ts` ships a `setX()` for
every reassignable export; use it, or add one. — [`architecture.md`](architecture.md)

**Do not close an import cycle.** Cross-module behavior goes through a callback slot in `state.ts`
registered in `start()`. Adding an import from `state.ts` (or a block module) back up to `main.ts`
will produce a partially-initialized module at load time, which shows up as a mystifying `undefined`
rather than an error.

**Formatting is enforced, not suggested.** Single quotes, semicolons, 2-space indent, 100 columns.
Run `deno task check` before saying anything is done.

## CSS

**Always write `.block:hover .handle`, never `.formula-block:hover .handle`.** Every block element
carries the shared `.block` class; the type-specific selectors **do not fire reliably** for
hover-reveal patterns. This applies to every hover-revealed affordance — resize handles, delete
buttons, drag grips.

**All styles live in `src/styles/main.css`** (1910 lines). There is no CSS module system; `dev.ts`
hot-copies this one file. Inline `style.cssText` appears in a few dynamically-built modals
(`license.ts`) — acceptable for modal-local styling, not for block styling.

## Unit rendering — the `psi` trap

**Use `transformUnit()`, never `transformPiece()`, when rendering unit abbreviations** in
`src/utils/markdown.ts`.

`transformPiece()` applies a Greek-letter substitution table (`psi` → `ψ`, `rho` → `ρ`, …) that is
**correct for variable names and wrong for unit ids**. A pressure of `psi` must render as `psi`, not
`ψ`. The two functions exist precisely because the same string means different things in the two
contexts. Getting this wrong produced silently wrong-looking engineering output.

## Build and dev

**Never remove `Cache-Control: no-store` from `dev.ts`.** Without it the browser caches stale CSS/JS
across dev restarts, and you debug code that is not running.

**Never hand-edit the version in `public/config.js` or the cache name in `public/sw.js`.** Bump
`"version"` in `deno.json`; `scripts/sync-version.ts` does the rest on the next `build`/`dev`.

**A version bump is the release action, not a formality.** The service worker is cache-first; an
unchanged cache name means returning users keep the old bundle. —
[`build-and-deploy.md`](build-and-deploy.md)

**Tag the release, or nothing deploys.** Deno Deploy follows the newest release TAG, not the default
branch. Pushing `main` alone left production on 2.1.4 while `main` held 2.2.0. —
[`build-and-deploy.md`](build-and-deploy.md)

## Math and units

**`addU` stays strict.** Never coerce mismatched units to make an expression evaluate. In a
calculation pad, a plausible wrong number is the worst possible output.

**Run `cleanU` before comparing unit maps.** `{in: 0}` and `{}` are the same unit only after cleaning.

**Expand compound units exactly once, in `parseUnitExpr`.** Expanding again downstream doubles
exponents.

**Only add `baseUnits` to a `UnitDef` when `1 [unit] = 1 [product of base units]` exactly.** Otherwise
expansion silently changes numeric values. — [`units.md`](units.md)

## Persistence and security

**The serializer keys off `encIv`/`encContent`, not `block.encrypted`.** Do not "simplify" it to trust
the flag — that leaks plaintext templates into saved project files. —
[`security-model.md`](security-model.md)

**Treat a `null` from `decryptTemplate()` as "unavailable," never as empty content.**

**Never render "couldn't reach the server" as a fact about the user.** Anything showing a role or
entitlement must check `entitlementsStale` / `accessUnverified()` first. Showing `Free — no packs`
to a paying customer whose connection dropped is a support ticket and a refund request. Degrade the
_message_, never the claim. — [`design-decisions.md`](design-decisions.md)

**Every new API route takes the user id from the verified Clerk JWT and from nowhere else** — never a
query string, body, or header. Every new database function takes `p_user_id` as a parameter rather
than trusting input. That pair replaced all of RLS. — [`security-model.md`](security-model.md)

**Never widen the API's CORS allowlist to a wildcard.** `ALLOWED_ORIGINS` is exact-origin on purpose;
a wildcard lets any site spend a signed-in user's session.

## Block config persistence

**`block.content` is the single source of truth. Re-read it immediately before every write.** Never
hold a parsed config across user interactions and serialise it later — a second handler will have
written to `block.content` in the meantime, and your snapshot silently reverts their work.

`plot.ts` had exactly this: `buildPlotBlock` parsed `cfg` once at build time, the marker popup wrote
its own freshly-parsed copy, and the settings handler serialised the build-time snapshot. Adjusting
the range therefore **resurrected cleared markers and discarded newly added ones** — the two handlers
were fighting over one field. Fixed 2026-08-13 with a `readCfg()` helper plus a read-modify-write in
both paths, and the build-time copy renamed `initialCfg` to signal it seeds the controls and must
never be written back.

**Persist raw values, not resolved ones.** The plot render assigns resolved `xMin`/`xMax` onto its
config copy for axis drawing, and that copy must not reach `block.content` — `xMinExpr`/`xMaxExpr`
are the truth, so overwriting them would freeze a range that was written as a variable.

## Method

**When you delete a trigger, hook, or default that upheld an invariant, hunt down every place that
quietly relied on it.** Dropping Supabase's `handle_new_user` trigger removed the guarantee that
every user had a `user_roles` row. `get_my_role` had always early-returned when that row was missing
— a branch that was nearly unreachable before and became the common path after, hiding purchased
packs from exactly the users who had paid. The dangerous edit is not the one that changes behaviour;
it is the one that changes _which branch is normal_. — [`backend-migration.md`](backend-migration.md)

**Test a backend directly, before the UI exists.** The entitlement chain — mint a code, redeem it,
read the role, derive the key — is ten SQL calls and needs no browser and no auth provider. Running
it caught two defects in one pass that would otherwise have surfaced as a paying customer receiving
nothing. — [`backend-migration.md`](backend-migration.md)

**There is no test suite — so state what you verified and what you did not.** The verification bar on
this project is an explicit list of what Jon needs to click. Do not report a change as working when
what you mean is that it compiled. — [`testing.md`](testing.md)

**Re-measure before quoting any number.** Line counts, version strings, category counts, and pass
counts in these files go stale silently, and a stale number is worse than none because it reads as
current.

**Grep before calling anything dead.** A symbol may be reached only through the `solver` import-map
alias, a callback slot in `state.ts`, or a `data-*` attribute referenced from `main.css`.
