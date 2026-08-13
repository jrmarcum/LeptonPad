# Known Issues, Traps, and Stale Documentation

All findings verified against the working tree on **2026-08-13** at version 2.1.4.

---

## 1. `public/config.js` held live credentials and was patched but never shipped

**RESOLVED 2026-08-13.** Three parts, all fixed:

- `scripts/sync-version.ts` no longer patches it — that was dead work, since nothing copies the file
  into `dist/`. It still patches `public/sw.js`, which **is** copied and matters.
- The live project URL and key it carried are gone, replaced by placeholders and a header stating the
  file is a shape reference and is not shipped.
- `dist/config.js` is now written by the single `scripts/write-config.ts`, replacing the
  near-identical generators `build.ts` and `dev.ts` each carried and which could drift apart.

⚠️ **The old key remains in git history.** It was a Supabase publishable anon key — public by design,
so no rotation is needed — but do not treat the history as clean, and do not repeat the pattern. The
lesson generalised: a `*.example` file is documentation and is committed; real values go only in
gitignored `.env*` files or a host dashboard. See [`backend-migration.md`](backend-migration.md).

---

## 2. Version drift between `deno.json` and the tracked artifacts

**RESOLVED 2026-08-13** — `deno.json`, `public/sw.js` and `dist/sw.js` all read **2.1.4**.

The drift was never a runtime bug: `sync:version` is the first step of both `build` and `dev`, so any
real build corrects it. It mattered because the tracked files _lied about the current version_, and
reading one of them to answer "what version is this?" gave the wrong answer. **`deno.json` is the
only source of truth** — check there, and treat `public/sw.js` as an output.

---
## 3. `CLAUDE.md` was gitignored the whole time it claimed to be portable

**Resolved by this `cmem/` directory (2026-08-13).**

`.gitignore` listed `CLAUDE.md`, and `git ls-files CLAUDE.md` returned nothing. Its own closing
section read: _"All project-level Claude memories are stored in this file (`CLAUDE.md`), which is
committed to the repo and travels with it."_ That was false — the file existed only on one machine's
hard drive, and a clone or a USB copy of this project arrived with **zero** project memory. The
`.gitignore` entry has been removed and `CLAUDE.md` is now tracked.

**Rule going forward:** project memory lives in tracked files under `cmem/`. `CLAUDE.md` is now a thin
pointer here. If someone re-adds content to `CLAUDE.md`, it is not memory — it is a local scratch
file that will be lost.
---

## 4. Stale claims inherited from `CLAUDE.md` / `readme.md`

Corrected in the topic files; listed here so they are not re-introduced.

| Claim                                                           | Reality                                                                                                                                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Solver: TypeScript math kernel (`src/solver/`)"                | The directory does not exist. Source is **`solver/solver.ts`** at repo root; **`src/solver.ts`** is an 11-line WASM loader shim aliased as `solver` in the import map. |
| "`src/blocks/plot.ts` — Plot block (**Plotters SVG via WASM**)" | Plotters is a Rust crate and has never been used here. `plot.ts` builds SVG as a **TypeScript string**, then attaches a crosshair with `createElementNS`.              |
| Implication that the math kernel runs in WASM                   | `src/expr.ts` is 960 lines of TypeScript running in the browser. WASM exports exactly three arithmetic functions.                                                      |

---

## 5. `mathwasm-custom-modules` — a localStorage key that cannot be renamed

`state.ts`: `export const CUSTOM_MODULES_KEY = 'mathwasm-custom-modules';` — and `main.ts` still logs
`'MathWasm Engine Ready'`. Both are residue from the project's pre-rename identity.

**Renaming the key would orphan every existing user's saved custom tools.** If it ever must change, it
needs a migration that reads the old key, writes the new one, and leaves the old in place for a
release or two. The console string is free to change.

---

## 6. `serve.ts` permanently mutates `dist/index.html`

`serve.ts` injects `<script>new EventSource('/__sse');</script>` into `dist/index.html` and **writes
it back to disk** (guarded by an `includes('/__sse')` check, so it happens once). `dev.ts` does the
same for `/__dev_sse`.

**Do not publish a `dist/` that has been served through `serve.ts` or `dev.ts`** — it carries a dev
SSE client that will hammer a nonexistent endpoint in production. Always rebuild before deploying.

---

## 7. Browser auto-open is Windows-only

Both `dev.ts` and `serve.ts` open the browser with
`new Deno.Command('cmd', { args: ['/c', 'start', url] })`. On macOS/Linux this fails; the server still
runs and the URL still works, but nothing opens. Fine for a Windows-only workflow — worth knowing
before anyone reports "dev doesn't work" on another OS.

---

## 8. `'table'` is a declared block type with no implementation

`Block['type']` includes `'table'`, but there is no `blocks/table.ts` and no sidebar entry. Treat it
as reserved. Any exhaustive `switch` over `Block['type']` must still handle it — and should handle it
loudly rather than falling through to a default that renders nothing.

---

## 9. `PX_PER_MM` is imported only to be lint-suppressed

`state.ts` imports `PX_PER_MM` from `types.ts` under a `// deno-lint-ignore no-unused-vars`. Either it
should be used or the import (and the suppression) should go. Small, but it is exactly the kind of
suppression that trains people to ignore the linter.

---

## 10. No automated tests for the math engine

**Partially addressed 2026-08-13:** the backend now has one — `deno task db:check`, ten assertions
over the entitlement chain, which caught two real bugs on its first run.

**`src/expr.ts` still has none, and that is the larger risk.** 960 lines of unit algebra with no
regression net, and a failure mode of **a wrong number that looks right** on a calculation sheet an
engineer stamps. See [`testing.md`](testing.md) for why it is also the easiest module in the codebase
to test: pure functions in, `Quantity` out, no DOM.
