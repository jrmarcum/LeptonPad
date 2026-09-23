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
| Implication that the math kernel runs in WASM                   | `src/expr.ts` is 1,718 lines of TypeScript (2026-09-22) running in the browser. WASM exports exactly three arithmetic functions.                                       |

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

## 10. No automated tests for the math engine — ADDRESSED 2026-09-23

**Partially addressed 2026-08-13:** the backend now has one — `deno task db:check`, ten assertions
over the entitlement chain, which caught two real bugs on its first run.

**`src/expr.ts` now has one too (2026-09-23):** `tests/` with 63 steps, run by `deno task test` and
included in `deno task check`, covering unit algebra, conversions, precedence, constants, every
built-in, matrices, the big operators and the rendering rules — with a named case for each bug fixed
in this week's sessions. Writing it found one more: a trailing unit tag on a **function definition**
was silently dropped, so `f(x) = x * 12 [in/ft]` computed without the in/ft. Fixed with the suite.

Still uncovered: everything that needs a DOM (blocks, drag, editing, layout, persistence, the service
worker). See [`testing.md`](testing.md).

---

## 11. Built-in constants silently shadowed user variables named `pi`, `e`, `tau` — FIXED 2.3.0

Found 2026-09-21. `Parser.atom()` checked `CONST[name]` **before** `this.scope[name]`, so after
`e = 0.5 [in]` (an eccentricity) every later `e` still evaluated to 2.718… with no error — a silent
wrong number, the worst failure mode. `\tau` for shear stress was shadowed the same way.

Fixed 2026-09-22 — Jon chose an **explicit constant marker** (declined: "your definition wins"):

- `\e` was Euler's number and the only spelling of it; plain `e` became an ordinary variable.
  **Revised 2026-09-23 (v2.3.11):** Jon replaced `\e` with the function **`exp(x)`**, which the
  renderer draws as eˣ. There is now no marked constant for Euler's number at all; `\e` is simply the
  variable `e`. `MARKED_CONST` holds only `\pi`.
- `\pi` is π; plain `pi` **also** stays π (too many `pi*d^2/4` sheets to break), and assigning to
  `pi`, `\pi` or `\e` is an explicit error.
- `tau` is no longer a constant (2π = `2*\pi`).

Mechanics: `stripGreekMarks` keeps the backslash on a _standalone_ `\e`/`\pi`; `lex()` emits it as an
`ID` token with the backslash, looked up in `MARKED_CONST` — no user name can contain `\`, so no
collision is possible. **Breaking by design:** sheets that used plain `e` as 2.718… now show
`Undefined: e` (an error, never a wrong number) until changed to `\e`.

---

## 11a. Unary minus bound tighter than `^` — FIXED 2.3.0 (changes existing results)

Found 2026-09-22 while testing `integral(\e^(-x^2), …)`, which returned 7.3×10¹⁴ instead of √π. The
grammar was `power → unary ('^' power)?`, `unary → '-' unary | atom`, so `-x^2` parsed as `(-x)^2` —
**a silent sign error on every `-a^n` with even n** (`-2^2` gave 4). Now `tagged` takes a leading
minus outside the power and its unit tag, and `power → atom ('^' unary)?` (so `2^-1` still works):
`-x^2` = −(x²), `-3 [in]^2` = −9 in². Matches Mathcad/MATLAB/Python; Excel is the outlier. **Sheets
that relied on the old reading now evaluate differently** — correctly.

---

## 11b. A block drag stole clicks from the markdown text block — FIXED 2.3.11

Reported 2026-09-23: the text block's toolbar and typing "misbehaved", and **the mouse could not place
a caret in the textarea**. Cause: `canvas.ts`'s block-drag handler listens on **`pointerdown`** (which
fires before `mousedown`) and calls `preventDefault()`. Its exemption list covered `INPUT` and
contenteditable but **not `TEXTAREA`** — the markdown editor. Every press on the editor therefore
started a drag and consumed the click, so there was no caret, no selection, and the toolbar's
selection-based actions had nothing to act on. `text.ts` stopped propagation only for `mousedown`,
which is too late.

Fixed on both sides: the drag handler now ignores a press that lands on
`textarea, input, select, button, [contenteditable="true"], .md-toolbar`, and the text block stops
`pointerdown` as well as `mousedown`. **Rule:** a control the user types in must be exempted in every
`pointerdown` handler that calls `preventDefault()`.

Found while investigating: `transformPiece` recursed forever on a string containing an unclosed `[`
(a link's `[](`, or mid-typing), blowing the stack in `prettifyExpr`. It now splits only when a
complete `[…]` tag is present.

---

## 12. Pre-2.2.5 sheets lost their Greek display — ACCEPTED

From 2.2.5 Greek renders only with a backslash (`\phi`). Sheets and purchased section templates that
use bare `phi_ty` now display `phi_ty`. Jon declined auto-migration on load — see
[`design-decisions.md`](design-decisions.md). Values are unaffected.

Fixed in 2.2.6: the section summary line (`updateSectionSummary`) used to write names and
comparisons as plain text, so `\phi_P_nr >= P_u` showed its backslash. It now renders through
`transformPiece`/`prettifyExpr`; `sectionSummaryVarNames` maps each name to its spelling **as typed**
so the Greek form survives.

---

## 13. Fixed 2.2.6 — gaps that only one block type had closed

Audit 2026-09-21 after the summary report. Rule of thumb it produced: **every path that evaluates
user text must apply the same preprocessing as formula rows.**

- **`==` read as assignment** — `evalStatements` used `indexOf('=')`, so `a == b` assigned `"= b"` to
  `a` and errored, and `f(x) == 3` redefined `f`. Now `search(/(?<![=<>!])=(?!=)/)` and `=(?!=)` in
  the function-definition regex.
- **Plots skipped `expandDotNotation`** — `beam1.L` failed in plot curves and ranges. The function
  moved from `formula.ts` to `expr.ts`; `evalPlotData` applies it to the curve and both bounds.
- **Plot sweep variable kept its `\`** — `\theta` was stored as the scope key `\theta` while the
  curve looked up `theta`. `evalPlotData` now keys by `stripGreekMarks(cfg.xVar)`.
- **`beam1.\phi_M`** — the dot rewrite required a letter after the dot; it now accepts `.\`.

Fixed in 2.3.10: a comparison ending in a single unit tag labelled its 0/1 result (`P_u != 0 [kip]`
→ `1 kip`). `compare()` marks its result `isTest` and `applyStatementUnits` leaves such a result
alone — the tag belongs to the value being compared against, which the comparison never needed.

---

## 14. Fixed 2.2.8 — title blocks on pages 2+ drifted down with Shift+Enter

Reported 2026-09-22: "the second and third sheets have shifted it down exactly three grid squares."
Title-block overlays carry the `.block` class (`'block title-block title-block-overlay'`), so every
`querySelectorAll('.block')` loop treats them as ordinary blocks. `shiftBlocksVertical` (Shift+Enter
= push everything below the grid cursor down one `GRID_SIZE`) moved each page-2+ overlay whose top was
below the cursor — three presses, three squares. Page 1's overlay sits above any valid cursor row, so
it never moved. Also fixed: rubber-band selection and right-click could select an overlay, after which
Ctrl+Arrow moved it and Ctrl+Delete removed it. `shiftBlocksVertical` now also skips section children
(their `top` is section-relative, so comparing it to a canvas Y was meaningless).

Overlay positions are never saved — `syncTitleBlocks()` rebuilds them at `i * PAGE_H + margins.top` —
so an already-displaced sheet corrects itself on reload or on toggling the title block.
`resolveOverlapsRight` already excluded title blocks; **any new `.block` loop must too.**

---

## 15. The repo lives on an exFAT drive — three symptoms, one cause (diagnosed 2026-09-23)

`D:` is **exFAT**, not NTFS (`Get-Volume -DriveLetter D`), with a **256 KB allocation unit**
(`AllocationUnitSize: 262144`). That single fact explains three things that look unrelated:

**a. "fatal: detected dubious ownership"** on every git command. exFAT records no ownership, so git
cannot verify the directory belongs to you. Permanently silenced 2026-09-23 with
`git config --global --add safe.directory D:/Programs/.../LeptonPad` — the entry now exists, so the
`-c safe.directory=…` prefix earlier sessions used is no longer needed.

**b. "could not write multi-pack-index: Permission denied" → "task 'geometric-repack' failed"** after
every commit and push. Git's auto-maintenance repacks, then tries to rename the new pack and index
over the old ones. On this volume a file that git still has memory-mapped cannot be replaced, so the
rename fails with `Permission denied` or `File exists`. **The repack itself succeeds first** — so
each failed run left a complete ~4 MB duplicate pack behind. The commit and the push were never
affected; only the cleanup was. Same failure mode as the `public/sw.js` "user-mapped section open"
build abort in [`build-and-deploy.md`](build-and-deploy.md) § Release checklist.

**c. `.git` had grown to 109 MB for a repo with 13 MB of packs.** 338 loose objects × a 256 KB
minimum allocation ≈ 86 MB of pure slack. Every small file on this drive costs 256 KB.

**What was done** (2026-09-23, repo verified `git fsck --connectivity-only` clean afterwards):

| Step                                                      | Effect                                                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `git config maintenance.auto false` + `gc.auto 0` (local) | Commits stop triggering the failing repack                                                                                         |
| `git prune-packed`                                        | Dropped 338 loose objects already inside a pack                                                                                    |
| Kept `pack-737a5ed…`, retired the other four              | It held **exactly** the 1084 reachable objects — it _was_ the consolidated pack `git repack -ad` kept failing to rename into place |

Result: 5 packs → 1, `.git` **109 MB → 18 MB**, no error on commit. The retired packs held only
unreachable history and one byte-identical duplicate; everything reachable is also on GitHub.

**Maintenance from here is manual and occasional** — auto-gc is off by design:

```
git prune-packed          # safe any time
git multi-pack-index write # works standalone; it is repack that cannot rename
```

`git repack -ad` will still fail if its output hashes to a pack name already on disk. That is not a
corruption — it means the pack it wants already exists. Check with
`git rev-list --objects --all | wc -l` against `git verify-pack -v <pack>.idx`; if the counts match,
the remaining packs are redundant.

**The real fix is to move the repo to an NTFS volume**, which would retire all three symptoms and the
`sw.js` build abort with it. Not done — Jon's call.

---

## 16. `syncContent()` silently destroys any formula-row field it does not copy — FIXED 2026-09-23

A formula block stores its rows as JSON in `block.content`. Two functions move data across that
boundary: `parseFormulaRows()` reads it, and **`syncContent()` rebuilds it from the row elements on
every keystroke and blur**. `syncContent` only carried `e`, `d`, `type` and `ref`.

So when per-row line spacing (`sp`) was added in v2.3.18, it round-tripped through parse but not
through `syncContent`: the spacing was correct until the user typed anywhere in the block, at which
point **every row's spacing was erased at once**. Reported as "a single row line spacing setting is
overwriting all of the other rows", which is what it looks like from outside.

Fixed in v2.3.20: the row element mirrors its spacing into `dataset.sp` and `syncContent` reads it
back. **Any field added to `FormulaRow` must be carried in `syncContent`, or it does not survive a
keystroke.** `tests/formula_rows_test.ts` guards this by asserting on the function's source, with
comments stripped so a comment mentioning a field cannot satisfy it.

---

## 17. An unknown unit id became a phantom unit — FIXED 2026-09-23 (v2.3.27)

`parseUnitExpr` accepted any name. `x = 5 [ksii]` displayed a normal-looking `5 ksii`, never
cancelled with anything real, and failed only much later — at conversion — with "No SI conversion
factor for unit". A typo that renders correctly on a calculation sheet is the worst failure mode
this project has.

Unknown ids now raise at parse time with a nearest-match hint (`did you mean "ksi"?`). Jon's ruling:
_"any unsupported unit should be rejected"_, with **no** mechanism to define one — see
[`design-decisions.md`](design-decisions.md).

Two things the fix exposed:

- Both `[unit]` and `[[unit]]` tags are parsed **outside** the per-statement `try` blocks in
  `evalStatements`, so the new throw escaped and killed the whole block's evaluation instead of
  marking one row. They now have their own guard. **Anything that can throw before those try blocks
  takes every row down with it.**
- An old sheet containing a phantom unit now shows an error on that row. Intended — it was always
  wrong — but it is a visible change to existing files.
