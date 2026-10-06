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

## 6. `serve.ts` permanently mutated `dist/index.html` — FIXED 2026-09-23 (v2.3.30)

Both `serve.ts` and `dev.ts` injected their live-reload `EventSource` into `dist/index.html` and
**wrote it back to disk**, so any `dist/` that had been served once carried a dev-only client that
in production hammers an endpoint which does not exist.

Both now inject into the **response** and serve the index from memory, matched by a small
`isIndexPath()` (`/` and `/index.html`); `dist/` stays exactly as `deno task build` produced it.
`serve.ts` also picked up the `Cache-Control: no-store` that `dev.ts` already had.

The committed `dist/index.html` was checked at the time and was clean — `build` regenerates it from
`public/index.html`, so production was never affected. The exposure was only a `dist/` published
after running `dev` or `serve` without rebuilding.

**The general rule this leaves:** a dev server may add whatever it likes to what it _sends_, and
nothing to what is on disk. Build output is an artifact of the build alone.

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

## 9. `PX_PER_MM` imported only to be lint-suppressed — ALREADY RESOLVED, entry was stale

**Re-verified 2026-10-02: there is nothing to fix.** `state.ts` no longer imports `PX_PER_MM`, and
there is no `no-unused-vars` suppression anywhere in it. The constant is genuinely used in two
places — `src/utils/units.ts` (`mmToPx`, `pxToMm`) and `src/types.ts` (the A4/A3 page sizes).

Kept as a record of the entry being wrong, not of a defect. The lesson is about memory rather than
code: **this entry survived two audits and a memory pass because nobody checked whether it was still
true.** A stale open item is worse than no entry — it spends attention on work that is already done
and, read in passing, suggests the linter is being ignored when it is not. When reviewing open
items, verify before relaying. The rule is already in
[`conventions.md`](conventions.md) ("Re-measure before quoting any number"); this extends it from
numbers to claims.

---

## 10. No automated tests for the math engine — ADDRESSED 2026-09-23

**Partially addressed 2026-08-13:** the backend now has one — `deno task db:check`, ten assertions
over the entitlement chain, which caught two real bugs on its first run.

**`src/expr.ts` now has one too (2026-09-23):** `tests/` with 97 steps across 6 files, run by `deno task test` and
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

### 2026-10-02 — the configuration now travels, and tidying is a task

`.git` had regrown to **125 MB** (429 loose objects × 256 KB ≈ 110 MB of slack; the packed content
was 4.9 MB). `git repack -ad` **succeeded** this time — 125 MB → 19 MB, 429 loose objects → 0, one
pack, `git fsck --connectivity-only` clean. So the rename failure is intermittent, not permanent:
it depends on whether git currently has the target pack mapped.

Jon's constraint, stated 2026-10-02: **the repo is meant to stay portable**, so moving to NTFS is
not the answer — exFAT is what lets the drive be read anywhere. The fix is to make the workaround
travel with the repo instead of living in one machine's config:

| Task                  | What it does                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `deno task setup:git` | One-time per machine: adds `safe.directory` for the repo's own path, sets `maintenance.auto false` + `gc.auto 0` |
| `deno task git:tidy`  | Occasional: `prune-packed`, `repack -ad`, then `fsck` — reports loose/pack counts before and after               |

Both are idempotent and report what they actually changed rather than claiming success.

⚠️ **`safe.directory` cannot be set repo-locally** — git deliberately ignores a repo-local value,
since a repo you do not trust must not be able to declare itself trusted. That is precisely why the
knowledge had to go into a tracked _script_ rather than `.git/config`: a fresh machine or a fresh
clone gets "dubious ownership" on every command until someone remembers the incantation, and now
they do not have to. `setup-git.ts` compares paths case-insensitively, because Windows hands out the
drive letter in either case and an entry differing only by `D:` vs `d:` does not match — which is
how the global list grew duplicate entries for other repos.

`git:tidy` treats a repack failure as expected-and-survivable rather than an error: it says so,
points here, and notes that everything reachable is also on GitHub.

**Moving to NTFS would still retire all three symptoms** and the `sw.js` build abort with them, but
it is explicitly not the chosen path — portability is the requirement.

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

## 18. Standard gravity was unreachable behind Grams — FIXED 2026-09-23

`g` was declared in **two** categories: `mass` (Grams) and `acceleration` (Standard Gravity).
`UNIT_LOOKUP` and `UNIT_CATEGORY_OF` are flat and **first-category-wins**, and mass is declared
first — so the acceleration entry could never be reached. `a = 0.4 [G]` written for a seismic
acceleration silently meant **0.4 grams**, and `m [kg] * 1 [g]` produced a kg·g quantity of
dimension M². The comment above `UNIT_LOOKUP` claimed ids were not shared across categories; they
were.

Jon's fix: **gravity is `G`, grams stay `g`** — unit ids are case-sensitive, so the two coexist.
`0.4 [G] [[m_s2]]` = 3.92266 m/s², `1 [G] [[ft_s2]]` = 32.17405 ft/s².

`tests/unit_catalog_test.ts` now guards the whole class: no id may be shared by two categories of
**different dimension** (sharing one at the same dimension is fine — `in3` is both volume and
section modulus, both L³). It also checks every category has a `CATEGORY_DIMENSION` entry and every
`baseUnits` key is itself a catalog unit — that second one matters because `baseUnits` expansion
writes its keys straight into the `UnitMap` **without** the unknown-unit rejection that user input
gets, so a typo there would recreate exactly the phantom units § 17 removed.

**A second defect this exposed, fixed the same day:** `2 [kg] * 1 [G] [[N]]` was an error, because
force had been given its own primitive dimension. Jon: _"We need to be able to convert the [kg]*[G]
into [N] as the multiplication creates this necessity for units cancelation."_ Correct — a newton
**is** kg·m/s². Force is now derived (M·L·T⁻²) and `lbf`/`lbm` are still separated, because mass is
`M` and they never depended on force being primitive. See
[`design-decisions.md`](design-decisions.md).

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

---

## 19. The 2026-09-23 code audit — what it found and what is still open

Jon invoked the "look for code issues" trigger twice. Four sweeps ran: stale workarounds, dead
code, silent fall-throughs, and initialisation order. **Every claim below was re-verified directly
before acting on it** — several agent findings were right about the line and wrong about the
consequence, and one ("`convert()` has 13 references") turned out to be the _word_ `convert`
inside error strings.

### Fixed — each was a wrong-but-plausible number, not a crash (v2.3.31)

| What                                  | The wrong answer it gave                                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Malformed unit exponent               | `[mm^]` became **dimensionless** (`Number('')` is 0, `cleanU` strips it) and then absorbed anything: `500 [mm^] + 3 [kg]` = 503 kg                                                               |
| Malformed number literal              | The lexer takes any run of digits and dots, so `1.2.3` → `1.2` and `2e` → `2`. A double-tap on the decimal key changed a dimension                                                               |
| Fraction rendering                    | `/` is left-associative but the renderer split at the FIRST `/`, drawing `a/(b/c)`. `M/S/1000` **drew an equation meaning 200000 beside a printed 0.2**                                          |
| Implicit `E = 200000`                 | Young's modulus for steel, in MPa, seeded into every sheet — dimensionless, invisible to the unit checker, and answering where every other undefined name throws                                 |
| `loadProject` merged constants        | Project B evaluated with project A's leftovers                                                                                                                                                   |
| Section summary                       | Fell back to a same-named **global**; a section redefining `L` printed the outer `L` while computing its own. Two different prefix defaults (`'section1'` vs `'section'`) made it fire routinely |
| `mod()`                               | Discarded units entirely — `mod(7 [ft], 3 [ft])` returned a bare `1`                                                                                                                             |
| `min`/`max`/`clamp`/`interp`/`round*` | Compared raw `.v` behind an exact-equality check. Relaxing the check alone would have returned the larger **number**, not the larger **quantity**                                                |

### Also fixed — robustness rather than arithmetic

`initAuth()` was re-entered on every code redemption (it is boot-once; each call added a Clerk
instance and two never-removed listeners, so auth events fired (N+1)² callbacks). Any boot failure
rendered a blank page under `'Wasm Load Error:'` — `start()` is one try/catch whose first two
awaits precede all UI, and `auth.ts` read `localStorage` unguarded. Seven resize handles captured
the pointer with no `pointercancel`. Block ids used `Date.now()` alone and collided within a
millisecond — and they are DOM ids, so a child could reparent into the wrong section. A failed
file-handle save degraded to a download silently. The figure block wrote a blank reconstruction
over unparseable content. Corrupt formula JSON was shredded on `;` and written back. A
multi-statement row reported only its first statement, hiding an error in any later one.

### The six leads — ALL NOW CLOSED (five in v2.4.1, the sixth in v2.5.0)

Each was verified in the code before being changed. They are kept here because the _shape_ of them
recurs: every one was a plausible-looking wrong answer rather than a crash.

1. **Plot range substituted a span instead of reporting** — FIXED v2.4.1. `resolveRangeQty` caught
   an eval error and returned `parseFloat(expr)` or the stored number, then drew the curve over it
   with the axes relabelled to match. A renamed bound variable, or `2L` (`parseFloat` gives 2),
   produced a normal-looking diagram over the **wrong length**. Plot bounds in _different_ units
   were unchecked too, so `from L1 [ft] to L2 [in]` swept raw numbers from two scales.
2. **`sect-prop` / `beam-def` inputs were never persisted** — FIXED v2.4.1. Neither builder received
   the `Block`, so `serializeProject` had nothing to write: reopening silently reset both to their
   defaults while still displaying a confidently formatted result. Second half: `if (!isNaN(...))`
   simply did not run on bad input, leaving the **previous** result on screen beside the new values.
   Invalid input now blanks the result to an em dash.
3. **A failed pack decrypt rendered a blank section** — FIXED v2.4.1. `if (!key) return` and a
   missing `else` both ended the chain silently, and because the serializer omits plaintext the
   content is `''` — so the section rendered empty and _normal_: no lock badge, no error, and no
   `.catch()` either. Every exit now leaves an `[Unavailable: …]` placeholder naming the reason.
4. **Pack edits discarded on save** — CLOSED v2.5.0, by changing the design rather than the code
   path. Held open through v2.4.1 and v2.4.2 as a product decision, because every available option
   cost something. **Input rows removed the trade**: the rows an author declares as inputs are the
   only editable ones, their values save as plaintext beside the ciphertext, and the rest of a pack
   block is now honestly read-only instead of silently discarding edits. See
   [`design-decisions.md`](design-decisions.md) § Input rows and § Two locks.
5. **An unknown `block.type` rendered as a contenteditable div** — FIXED v2.4.1. It overwrote
   `block.content` with its own flattened text on blur: structured data destroyed by clicking in and
   out again. Now read-only with an "Unsupported block" notice, so the block round-trips and a build
   that understands the type recovers it. Removing the fallback also let TypeScript prove the chain
   exhaustive.
6. **Summary comparisons that failed to evaluate were dropped** — FIXED v2.4.1. The summary showed
   only the checks that worked — all ticks — and **a silently absent check reads as a passing one**.
   They are now carried with their error and rendered amber: broken is its own state, neither pass
   nor fail.

---

## 21. `lineSpacing` was written but never read back — FIXED 2026-09-23 (v2.5.0)

`serializeProject()` wrote `out.lineSpacing`, and the block literal in `loadProject()` never listed
it. Block-level line spacing therefore **reverted to single on every reload**, from the day it was
added (v2.3.19) until v2.5.0.

Worth its own entry because of how it hides: the setting looked _forgotten_, which reads as a
feature that was never finished rather than a bug — and the value was in the file the whole time, so
anyone who checked the saved JSON would have seen it written correctly and concluded the save path
was fine. It was.

**The check that catches this class:** a field added to the serializer must be added to the loader in
the same commit, and `loadProject()`'s block literal is an explicit allowlist — a field absent from
it is dropped in silence. Grep both directions when adding a `Block` field. (This is the same shape
as § 16, where `syncContent()` destroys any row field it does not copy back.)

---

## 22. Nothing in the tree sets `packId` — the pack pipeline is scaffolding meeting scaffolding

Verified 2026-09-23 by grepping the whole tree: `packId` is **read** in `persistence.ts` (load,
decrypt, serialize) and `section.ts` (the unowned-pack placeholder), and **never assigned**. No code
path authors, purchases or places a pack block.

Consequences to keep in mind before trusting anything pack-shaped:

- The encryption invariant, the per-user key derivation and the v2.5.0 pack lock are all correct **by
  construction** and **untested end to end**. No one has ever opened a real pack block.
- The section-pack storefront in [`roadmap.md`](roadmap.md) is the missing half.
- `encryptTemplate()` in `src/crypto.ts` has no caller. It was deliberately kept (Jon, 2026-09-23:
  _"Keep the scaffolding. We will use it later."_) — do **not** remove it in a dead-code sweep.

⚠️ There is also an unresolved question here: a pack section's **children** are ordinary top-level
blocks carrying `parentSectionId`, and they serialize their own `content` in plaintext. Only the
section block's own `content` is encrypted, and `buildSectionBlock` never reads it. Whoever builds
the storefront has to settle how a pack's child blocks are actually carried — the current shape
would write the template body in the clear.

---

## 20. The Page Numbering checkbox did nothing, and the Title Block erased it — FIXED 2026-09-23

Reported as "the Page Numbering checkbox toggles active/inactive depending on the Title Block".
Two defects, the second invisible from that description:

1. **Turning the Title Block on overwrote the preference.** It called
   `setPageNumberingEnabled(false)` rather than suppressing the effect, and turning it back off
   re-enabled the control without restoring the value. `loadProject` did the same, in its own copy.
2. **The checkbox had no effect at all.** `syncPageSeparators` drew page numbers on the condition
   `!titleBlockEnabled` and **never read `pageNumberingEnabled`** — so with the title block off,
   unchecking Page Numbering did nothing.

The two concerns are now separate: `pageNumberingEnabled` is the user's preference and the title
block never writes it; `titleBlockEnabled` suppresses the **display** (the title block carries its
own sheet number). The draw condition is `pageNumberingEnabled && !titleBlockEnabled`, one exported
`syncPageNumberingToggle()` reflects state in the sidebar, and the preference is now saved as
`page_numbering` in the project file — it was not persisted before, which is part of why the silent
flip went unnoticed.

**The pattern worth remembering:** the same DOM manipulation existed in `main.ts` and
`persistence.ts`, and _both copies were wrong in the same way_. That is the second time in one day
— see the `'section1'`/`'section'` prefix split in § 19. Duplicated logic does not drift apart
gradually; it is usually copied wrong once and then maintained in both places.

## 23. On iPad every save produced another `Untitled.json` — FIXED 2026-10-05 (v2.8.9)

Reported by Jon from a real iPad. Two symptoms, **one branch**: Safari on iOS has no
`showSaveFilePicker`, so `saveProject()` fell through to the blob-download path.

- ⚠️ **iOS Safari ignores `a.download` for a blob URL** and names the file from the blob's MIME
  type. `application/json` gave `.json`, and `Untitled` is Safari's own default — so
  `PROJECT_EXT` and the project name never reached the file at all.
- **No file handle means no overwrite.** Every save was a fresh download, and iOS numbers
  duplicates rather than replacing them.

**Fixed with Web Share, tried before the download.** A `File` carries its own name, which the
share sheet honours, and "Save to Files" there offers **Replace** — the only route to overwrite
semantics on iPad. Cancelling the sheet is an `AbortError` and leaves the project **dirty**, the
same reading the picker's own cancel already had; anything else falls through to the download.

Two latent faults in the download path were fixed alongside, both Safari behaviours: the anchor is
now **in the document** before `click()` (a detached anchor's click is ignored there) and the
object URL is revoked **on a timer** rather than in the same tick, which could cancel the download
before the blob was read.

🔑 **The lesson is about branch coverage, not about Safari.** The picker path had been exercised
for months on a desktop; the fallback beneath it had effectively never run, and it was wrong in
three independent ways at once. **A fallback that only executes on a platform nobody develops on
is untested code** — when one exists, say which platforms take it and test there deliberately.

## 24. A finger could not move the page — FIXED 2026-10-05 (v2.8.10)

Reported by Jon from a phone. `#canvas` carried **`touch-action: none`**, which tells the browser
to perform no default touch behaviour on the element. Since the canvas is what a finger lands on,
every touch beginning on the sheet was refused both the scroll of `main` and pinch zoom. The sheet
was 816px wide in a 390px viewport with no way to reach the rest of it.

It was there for block dragging — but **`.block` carries its own `touch-action: none`**, so
dragging never depended on the canvas rule. Now `manipulation`: pan and pinch, minus
double-tap-to-zoom, which on a calculation sheet mostly fires by accident while tapping cells.

**Rubber-band selection was never the obstacle**, which is worth recording because it looked like
the reason the rule existed. On touch it already waits out a 500 ms hold and cancels on >10px of
movement, so a drag pans and a hold selects, with no change needed.

⚠️ **Two near neighbours were wrong for the same reason** and went in with it: `#app` had
`height: 100vh` (on iOS that is the height _without_ Safari's toolbars, so the bottom of the app
is unreachable — now `100dvh` with a `vh` fallback) and `width: 100vw` (includes the scrollbar,
forcing a horizontal scrollbar on desktop — now `100%`).

🔑 **The shape to remember: a property set to make one interaction work, applied to a container
rather than to the thing it was about.** `touch-action: none` belonged on the draggable, and
putting it on the surface disabled every other gesture on the surface. The same question is worth
asking of any `user-select`, `pointer-events` or `overflow` rule sitting on a container.

## 28. Norton Secure Browser closed on launch after v2.9.0 — MITIGATED 2026-10-05 (v2.9.1)

Reported by Jon. v2.9.0 put two new things on the **critical boot path**, inside `start()`'s
single `try`: an IndexedDB read, and a **`confirm()` dialog** for the autosave restore. A blocking
modal during boot is one of the few things a WebView-based browser can die on rather than merely
refuse, and Norton had already shown it restricts file APIs that other Chromium builds allow.

⚠️ Not reproduced here — no Norton Secure Browser to test on. The fix is to make the suspect code
**incapable of mattering**, not to guess which line it was:

- The restore prompt is a **banner, never `confirm()`**. It also fixes a quieter bug: in a browser
  that declines dialogs, `confirm()` returns `false` immediately, and the old code read that as
  "discard" and **deleted the user's recovered work** without asking.
- Library services are **deferred past first paint** (`requestIdleCallback`, 3 s timeout) and no
  longer awaited by `start()`. Each is individually wrapped, so a failure is contained to itself.
- `?safe=1` turns the library, autosave and restore off, sticky in `localStorage`, with a "Turn
  safe mode off" button in the sidebar.

🔑 **Every feature that runs during boot needs an off switch reachable from outside the app.**
When a browser closes on launch there is no settings screen and no console — a URL the user can
type is the only lever left. v2.9.0 had none, so there was no way to even establish whether
LeptonPad was the cause.

🔑 **And the second rule it broke: a convenience must not sit on the critical path.** Autosave and
the library are conveniences. `await`ing them in `start()` gave each the power to stop a sheet
from opening, which is a trade nobody would have agreed to if it had been put that way.

## 25b. …and restoring the name was not enough — FIXED 2026-10-06 (v2.9.3)

§ 25 made `loadProject` read `project_metadata.name` back. Jon loaded a project the next day and
the field was still empty of anything useful.

🔑 **Because every file saved before the fix contains the placeholder AS its stored name.** There
had never been a way to set anything else, so `serializeProject()` wrote `"Untitled Project"` into
every file it ever produced — and reading that back faithfully produces "Untitled Project". The
restore worked perfectly and changed nothing.

⚠️ **The lesson is about fixing a round trip in a world that already has files in it.** Repairing
the read half assumed the written half had been carrying something worth reading. It had not, and
every existing file was already poisoned with the default. **When a field starts being persisted,
ask what the files that predate it actually contain** — the answer is rarely "nothing", it is
usually "a placeholder that now looks like data".

Fixed by `resolveProjectName(stored, fileName)`: a real stored name wins, otherwise the **file's
own name** does, otherwise the placeholder. That is also better behaviour on its own terms — the
file is what the user picked and what they know the project by — and the stored name still wins
when present, because it keeps the spaces and capitals `saveProject` strips out of a filename
(`[^\w-]` → `_`).

`DEFAULT_PROJECT_NAME` is now one constant in `types.ts`, because the "is this merely the
placeholder?" test has to compare against the same string the placeholder is written from; two
copies would drift and the test would quietly start answering no. The decision is pure and lives
in `tests/project_name_test.ts` — applying it needs a DOM, deciding it does not.

## 25. Every project was named "Untitled Project" — FIXED 2026-10-05 (v2.8.11)

Found while chasing the iPad filename. **`serializeProject()` wrote `project_metadata.name`
faithfully, `loadProject()` discarded it, and nothing in the app could set it.** So the name was
`'Untitled Project'` from `state.ts` for the life of every project, and the saved file was named
after it. On iOS Safari's renaming (§ 23) stacked on top, giving `Untitled.json`.

⚠️ **Three separate holes, each harmless-looking on its own.** A write with no read, a read that
was never written, and no UI — and the symptom was a filename, which is the last place anyone
looks for a persistence bug. The round-trip test added in § 21 covers `Block` fields, which is
where the previous instance of this was; `project_metadata` was outside its reach.

Fixed by restoring the name in `loadProject`, adding a **Project** field in the sidebar above
Cursor (Jon's placement), and a `setOnProjectNameChanged` slot so a load or a reset refreshes the
box. **No dirty flag was needed**: `projectFingerprint()` serializes the name, so renaming already
counts as an unsaved change — the derive-don't-reconcile rule paying off again.

## 26. Saving on Android was silent, and opening could be impossible — FIXED 2026-10-05 (v2.8.11)

Jon: _"I can't tell if it is actually doing either."_ Two independent causes.

**Save.** Android Chrome has no `showSaveFilePicker`, so it takes the download fallback — where
the file lands in Downloads with no shelf, no picker and no dialog. Unlike iOS it _does_ honour
`a.download`, so the name was right; there was simply no evidence anything had happened. Fixed
with `showToast()` (`src/utils/toast.ts`), now reporting on all three save routes. ⚠️ **A silent
success is a bug on a platform with no ambient feedback** — the desktop's download shelf had been
doing that job invisibly.

**Open.** `PROJECT_ACCEPT_ATTR` was extensions only (`.leptonpad,.json`). Android's document
providers filter by **MIME type** and have no mapping for an invented extension, so a `.leptonpad`
file is greyed out and cannot be selected at all. Now carries `application/json` and
`application/octet-stream` as well — a noisier picker on Android, in exchange for files that can
be opened.

## 27. No way to reach any Ctrl or Alt command from a phone — FIXED 2026-10-05 (v2.8.11)

Jon: _"The phone keyboard does not have a 'ctrl' or 'alt' button."_ The inventory turned out
better than expected — **the long-press → `contextmenu` bridge in `canvas.ts` already covered
every `Ctrl` shortcut** (`+ row after`, `+ row before`, `+ if`, `+ for`, `× delete row`, `Copy`,
`Paste`), and there is no Ctrl+S at all because Save is a sidebar button. Two real gaps remained:

- **Undo was unreachable.** Ctrl+Shift+Z had no menu entry, so an accidental delete on a phone was
  permanent. Now `↶ undo delete`, via `canUndoRow()` / `undoRow()` on the row action registry,
  hidden when the stack is empty.
- **Moving between cells with the keyboard up.** Soft keyboards send no arrows and no Tab, and the
  keyboard covers most of the sheet. Now the **cell accessory bar** (`src/touch-bar.ts`).

🔑 **The bar dispatches keystrokes rather than calling actions.** `+ row` sends Ctrl+Enter to the
focused cell and the existing handler does the work, so the bar knows nothing about rows and
cannot drift from the keyboard. It follows the synthetic-event precedent `canvas.ts` already set
for long-press.

⚠️ **Two details the pattern lives or dies on.** Buttons `preventDefault()` on `pointerdown`,
because taking focus would blur the cell, close the keyboard and send the keystroke to nothing.
And the bar is positioned from `visualViewport`: the keyboard shrinks the **visual** viewport
without changing the layout viewport, so the gap between them is the keyboard's height — a bar
pinned to the layout viewport's bottom sits underneath the keyboard, which is the usual way this
is got wrong.
