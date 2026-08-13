# cmem — Portable Project Memory for LeptonPad

This folder is the **authoritative, portable project memory** for LeptonPad. It lives inside the
project tree, so it travels with the project (USB drive, clones, another machine) and is **committed
to git** — unlike a machine-local `CLAUDE.md` or a `~/.claude/projects/.../memory/` directory.

**Format:** plain Markdown — one focused topic file per domain, so any single concern can be reviewed
and revised without wading through one giant file. Keep files small and single-topic.

---

## ⚡ READ THIS FIRST — the backend is Neon + Clerk, migrated 2026-08-13

**LeptonPad does not use Supabase.** Identity is **Clerk**, the database is **Neon Postgres**, and a
small **Deno Deploy** API (`api/main.ts`) sits between them holding the security boundary. The driver
was cost: Supabase's free tier pauses a project after a week of inactivity, and Appwrite and Nhost —
the obvious alternatives — pause identically.

The migration was completed and the Supabase code removed the same day: `src/backends/supabase.ts`,
`supabase/schema.sql`, and the `@supabase/supabase-js` import all deleted. **Every topic file below
has been rewritten to the migrated state** — where Supabase still appears, it is deliberate history
explaining why something is shaped the way it is, never a live description.

**The one rule that replaced RLS:** the user id comes from the verified Clerk JWT and from nowhere
else. Full account: [`backend-migration.md`](backend-migration.md).

## ⚡ ALSO READ THIS

**`CLAUDE.md` was never portable.** It is listed in `.gitignore` and is **untracked** — verified
2026-08-13 with `git ls-files CLAUDE.md` (empty). Its own closing section claimed "this file is
committed to the repo and travels with it," which was false the whole time. That is exactly why
`cmem/` now exists: everything that file held has been folded into the topic files below, and
`CLAUDE.md` is reduced to a pointer that redirects here.

**Three facts inherited from `CLAUDE.md` and `readme.md` were stale.** They are corrected in the
topic files and recorded in [`known-issues.md`](known-issues.md) so they do not get re-introduced:

1. The solver source is **`solver/solver.ts` at the repo root**, not `src/solver/`. `src/solver.ts` is
   the 11-line browser loader shim.
2. The plot block is **pure TypeScript SVG string building** (`src/blocks/plot.ts`), not "Plotters SVG
   via WASM." Plotters is a Rust crate; LeptonPad has never used it.
3. The math evaluator (`src/expr.ts`, 960 lines) is **TypeScript, not WASM**. The only WASM in the
   product is three trivial arithmetic functions in `dist/solver.wasm`.

**What is true now, in one paragraph.** LeptonPad is a Deno 2.x browser PWA at **v2.1.4**
(`deno.json`) — a drag-and-drop engineering calculation pad. `deno bundle --platform browser` emits
`dist/main.js` (403 KB) from `src/main.ts`; all math, units, markdown, and plotting are TypeScript
running in the browser. Identity is Clerk; roles, license codes, and section-pack ownership live in
Neon Postgres behind a three-endpoint Deno Deploy API that is the sole security boundary. Purchased
section templates are AES-256-GCM encrypted with a per-user, per-pack key derived server-side as
`HMAC-SHA256(pack_secret, clerk_user_id)`. ~11k lines across `src/`, `api/`, `db/`, `solver/`, and
the build scripts.

## Policy (durable — set by the project owner 2026-08-13)

- **`cmem/` is the single home for ALL project memory.** When Jon (or anyone) says "**update the
  project memory**," that means: fold the latest decisions, found bugs, design changes, and current
  state into the matching `cmem/` topic file(s) — then add/refresh its one-line pointer in the Files
  table below. Convert relative dates to absolute; update existing entries rather than duplicating.
- **Nothing goes in a machine-local memory store.** Not `~/.claude/projects/<slug>/memory/`, not an
  untracked `CLAUDE.md`, not a scratchpad. If it is worth remembering about this project, it goes in
  a tracked file under `cmem/`.
- **`readme.md` is NOT project memory.** It is the public, user-facing document — what LeptonPad is,
  how to run it, block types, unit syntax. Keep internal decision logs and bug post-mortems out of
  it; those live here.
- **`THIRD_PARTY_NOTICES.md` is the compliance source of truth**, not memory.
  [`licensing.md`](licensing.md) records the _why_ and the strategy; the ledger of actually-shipped
  third-party code lives in `THIRD_PARTY_NOTICES.md`. Keep them consistent.

### The "update the project memory" trigger (binding on every agent)

When Jon says **"update the project memory"** (or a clear synonym — "update memory", "record this",
"remember this for the project"), the required action is ALL of:

1. **Revise all relevant `cmem/` files** — fold in the latest decisions/bugs/design changes/state;
   refresh the one-line pointer in the Files table; convert relative dates to absolute; update
   existing entries instead of duplicating.
2. **Sync `readme.md` where, and only where, the change is user-relevant** — install/usage, block
   types, unit syntax, roles — so the README matches reality without absorbing internal detail.
3. **If the work produced a transferable METHOD lesson — one that would apply to a completely
   different subsystem — add it to [`conventions.md`](conventions.md) as well**, one bold rule plus a
   citation back to the incident. The detail stays in its home file; only the rule is copied.

### The "check the deploy" trigger

A version bump is not a deploy. Before saying a release shipped, confirm the chain in
[`build-and-deploy.md`](build-and-deploy.md): `deno.json` version → `sync-version.ts` →
`public/sw.js` cache name → fresh `dist/`. **If the service-worker cache name did not change, the
browser is still serving the old JS** and any "it's not fixed" report is about stale bytes, not code.

### The "look for code issues" trigger (binding on every agent)

When Jon says **"look for code issues"** (or "code audit", "audit the code", "hunt for bugs"),
perform a comprehensive audit across both exercised and unexercised paths — the goal is to catch what
will not surface in today's browser testing but will bite a future change. Four categories:

1. **Stale workarounds** — `TODO`/`FIXME`, "for now" shortcuts, `deno-lint-ignore` suppressions.
   Is each still needed?
2. **Dead code** — unused exports, orphaned helpers, legacy fields. **Verify with grep before calling
   it dead** — a symbol may be reached only through the `solver` import map alias, a callback slot in
   `state.ts`, or a `data-*` attribute in `main.css`.
3. **Bugs** — dimensional-analysis errors, unit-cancellation mistakes, `let`-export mutation ordering,
   circular-import initialization holes, `null!` fields read before `start()` assigns them.
4. **Silent fall-throughs (the worst failure mode)** — a unit id that is not in the catalog, an
   unhandled block `type`, a decrypt that returns `null` and renders as empty. **A calculation pad
   that shows a wrong number is worse than one that shows an error.**

Because there is **no test suite** (see [`testing.md`](testing.md)), the verification bar is: state
exactly what you changed, what you could not verify, and what Jon needs to click to confirm it.

## Files

| File                                           | What it holds                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [overview.md](overview.md)                     | What LeptonPad is, the repo layout, the key-file table, and the mental model of how a keystroke becomes a rendered result. Start here.                                                                                                                                                                                                                                         |
| [architecture.md](architecture.md)             | Module graph and the two patterns that hold it together: the mutable-`state.ts` singleton and the callback-slot registry that breaks circular imports. Also the render pipeline and the PWA/service-worker layer.                                                                                                                                                              |
| [math-engine.md](math-engine.md)               | `src/expr.ts` — the tokenizer/parser/evaluator, `Quantity` + `UnitMap` dimensional analysis, compound-unit expansion, `[unit]` vs `[[targetUnit]]`, affine temperature, control flow, and the `fnScope` `targetUnit` mechanism.                                                                                                                                                |
| [units.md](units.md)                           | The 22-category unit catalog: the `toBase(x) = x*factor + offset` conversion model, `baseUnits` decomposition, the metric/english/both system split, and why unit conversion is TypeScript and not WASM.                                                                                                                                                                       |
| [blocks.md](blocks.md)                         | The nine block types, what each does, the stretch/resize handle matrix, section blocks and variable scoping (`beam1__L`), summary blocks, and custom modules (multi-block user tools).                                                                                                                                                                                         |
| [backend-migration.md](backend-migration.md)   | ⭐ **The 2026-08-13 move off Supabase to Neon + Clerk + Deno Deploy** — why (free tiers that pause), what changed across `src/backend.ts`, `src/backends/`, `db/schema.sql` and `api/main.ts`, where the security boundary went, the bundle-size fix, the two bugs the first end-to-end test caught, and where configuration lives. Read before touching anything auth-shaped. |
| [auth-and-licensing.md](auth-and-licensing.md) | Clerk identity + the Neon schema: the four-role hierarchy, the five tables, the three `p_user_id` functions, license-code minting and redemption, the admin tasks (`promote`, `db:check`), the code-based sign-up flow, and the offline localStorage cache.                                                                                                                    |
| [security-model.md](security-model.md)         | The encryption invariant (ciphertext only, never plaintext, in project JSON), per-user key derivation, RLS posture, and the **explicitly accepted** weaknesses: client-side role gating and cached pack keys in `localStorage`.                                                                                                                                                |
| [build-and-deploy.md](build-and-deploy.md)     | The `deno task` graph, the version-sync chain, service-worker cache busting, the dev server's SSE auto-shutdown, and the `dist/config.js`-is-generated gotcha.                                                                                                                                                                                                                 |
| [design-decisions.md](design-decisions.md)     | Why each non-obvious choice was made — TS-not-WASM for math, compound expansion and its display side effect, mutable module state, plot sweep-variable unit propagation, fixed `TITLE_BLOCK_H`, `globalThis` over `window`.                                                                                                                                                    |
| [conventions.md](conventions.md)               | The coding rules that were paid for: `.block:hover` not `.formula-block:hover`, `transformUnit()` not `transformPiece()` for unit ids, `globalThis` not `window`, delete unused imports, never remove `Cache-Control: no-store`.                                                                                                                                               |
| [known-issues.md](known-issues.md)             | Live defects and traps: `public/config.js` is patched but never shipped (and holds real credentials), version drift, `CLAUDE.md` untracked, the `mathwasm-` localStorage key that cannot be renamed, Windows-only browser launch.                                                                                                                                              |
| [testing.md](testing.md)                       | The honest state: there is no automated test suite. What `deno task check` actually covers, what Jon verifies by hand in the browser, and the manual regression checklist for the risky subsystems.                                                                                                                                                                            |
| [licensing.md](licensing.md)                   | LeptonPad is proprietary, all rights reserved. What that means for dependency choice, and the two MIT components (`@std/*`, `@jrmarcum/wasmtk`) reproduced in `THIRD_PARTY_NOTICES.md`.                                                                                                                                                                                        |
| [collaboration.md](collaboration.md)           | How Jon works: browser-verified features, concise responses, engineering-terms feature requests, the bump-and-deploy cycle. Read before the first reply of a session.                                                                                                                                                                                                          |
| [roadmap.md](roadmap.md)                       | Where the project stands at v2.1.4 and what is queued — the `WASM-READY` markers, the section-pack storefront, and what is deliberately not being built.                                                                                                                                                                                                                       |
