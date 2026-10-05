# Architecture

## The two patterns that hold the app together

### 1. `state.ts` is a mutable singleton, not an injected store

Every module does `import { state, globalScope, canvas } from './state.ts'` and **mutates in place**.
There is no store, no reducer, no dependency injection. `state.ts` header says so explicitly:

> All modules import directly from here and mutate in place — no injection.

Consequences worth knowing before you change anything there:

- **`export let` + setter pairs.** ES modules give live bindings on read but forbid external
  assignment, so every reassignable value ships with a setter: `CANVAS_W`/`setCANVAS_W`,
  `numPages`/`setNumPages`, `titleBlockEnabled`/`setTitleBlockEnabled`, `selectedEl`/`setSelectedEl`,
  `fileHandle`/`setFileHandle`, and so on. **Never assign to the exported `let` from another module**
  — it is a compile error, and the fix is always to add or use the setter.
- **`null!` fields are start-order contracts.** `canvas` and `bandEl` are declared `null!` with the
  comment "assigned in `start()` before any user events." Anything that reads them before `start()`
  completes gets a null-deref. If you add module-level code that touches `state.canvas`, you have
  broken that contract.
- **Derived state is rebuilt, never persisted.** `childToSection` is a `Map` rebuilt from each
  block's `parentSectionId` on load. `sectionSummaryVarNames` and `sectionSummaryComparisons` are
  runtime-only. Do not serialize them.

### 2. Callback slots break circular imports

`main.ts` needs the blocks; the blocks need to trigger sidebar/canvas behavior in `main.ts`. Rather
than import cycles, `state.ts` holds a registry of nullable function slots that `start()` fills once:

```
onSectionSummaryUpdate      onRefreshAllSectionHeights   onSelectBlock
onMoveGridCursor            onUpdatePageCount            onSyncPageSeparators
onClearSelection            onAddToSelection             onRefreshCustomModulesList
onAppendCustomModuleToSidebar                            onAuthStateChange
```

Each has a matching `setOnX()`. **When you add cross-module behavior, add a slot — do not add an
import that closes a cycle.** `CanvasLike` in `state.ts` exists for the same reason: it is a
structural interface so `state.ts` never has to import `canvas.ts`.

## Module graph

```
                  main.ts  ── start() ──▶ registers every callback slot
                     │
   ┌─────────────────┼──────────────────┬─────────────┬──────────────┐
   ▼                 ▼                  ▼             ▼              ▼
canvas.ts         dnd.ts          blocks/*.ts   persistence.ts    auth.ts
   │                 │                  │             │              │
   └─────────────────┴────────┬─────────┴─────────────┘              ├─▶ crypto.ts
                              ▼                                      └─▶ license.ts
                           state.ts  ◀── types.ts
                              │
               ┌──────────────┴───────────────┐
               ▼                              ▼
            expr.ts                     utils/markdown.ts
               │                              │
               └────────▶ utils/unit-defs.ts ◀┘
                           utils/units.ts
```

`solver` (the import-map alias for `src/solver.ts`) hangs off `main.ts` (init) and the two math
blocks. Nothing else touches WASM.

## The evaluation pipeline

A keystroke in a formula block becomes a rendered result through this path:

1. **`input` event** on the block's editable element (`blocks/formula.ts`).
2. **`evalFormulaRows()` / `evalStatements()`** (`expr.ts`) parses the block's text into `Statement`s,
   handling control flow (`if`, `for`) via `parseRowsToAST` → `execNodes`.
3. Each expression goes through **`lex()` → `Parser` → `Quantity`**, reading and writing the shared
   `globalScope` and `globalFnScope` from `state.ts`.
4. Units are composed by `mulU`/`divU`/`powU`/`addU`, and `applyTargetUnit()` runs when a
   `[[targetUnit]]` is present.
5. **`renderExpr()` / `renderMarkdown()`** (`utils/markdown.ts`) turns the result and the source
   expression into display HTML — including the `transformUnit()` vs `transformPiece()` split that
   keeps `psi` from becoming `ψ` (see [`conventions.md`](conventions.md)).
6. Section-scoped side effects fire through the callback slots: summary vars, section heights, page
   count, page separators.

**Because `globalScope` is shared and evaluation is document-order, editing an upper block changes
every block below it.** Any change to evaluation order or scope lifetime is a breaking change to user
sheets.

## Canvas and layout

- `canvas.ts` owns the DOM element, the **snap grid** (`GRID_SIZE = 20`), the margin guide, and page
  separators. `PX_PER_IN = 96`; `PX_PER_MM = 96/25.4`.
- Page sizes (`types.ts`): `a4`, `a3`, `letter` (default), `legal`, `tabloid`. `CANVAS_H = numPages *
  PAGE_H`.
- Default letter margins: top 0.25", bottom 0.25", **left 0.75"** (binding edge), right 0.25".
- `TITLE_BLOCK_H = 112` is a **constant, never measured from the DOM** — the comment says "to avoid
  layout-timing bugs," and that is load-bearing: measuring it produced wrong values before layout
  settled. `titleBlockH()` returns 112 or 0 depending on `titleBlockEnabled`.
- The title block is an **overlay**, deliberately not a member of `state.blocks`.

### The app shell, and what it does on a small screen

`#app` is a flex row of `#sidebar-left` (16rem) and `main` (`overflow: auto` — **`main` is the
scroll container**, not the body, which is `overflow: hidden`). `#canvas` sits inside `main` at a
fixed pixel size: letter is `8.5 × 96 = 816px` wide, and that is the point of the product rather
than an accident. A phone cannot show it 1:1, so the mobile story is **pan and pinch over a
full-size sheet**, never a reflowed one.

🔑 **`touch-action` on `#canvas` is what decides whether a finger can move the page.** It was
`none` until 2026-10-05, which refused the browser both the scroll of `main` and pinch zoom — see
[`known-issues.md`](known-issues.md) § 24. It is now `manipulation`. `.block` keeps its own
`touch-action: none` for dragging, which is where that rule always belonged.

⚠️ **`#app` uses `100dvh` with a `100vh` fallback.** Plain `100vh` on iOS is the height _without_
Safari's toolbars, so the bottom of the app sits underneath them and the last inch of the sheet
cannot be reached.

**The sidebar collapses** (`initSidebarToggle()` in `main.ts`), to `width: 0` rather than
translated off-canvas, so `main` reclaims the width and the sheet re-centres. The preference lives
in `localStorage` and **wins over** the `< 900px` auto-collapse, which only chooses the initial
state — a width rule that overrode an explicit choice would re-collapse on every reload for
someone working in a narrow window deliberately.

⚠️ **There are still no width breakpoints anywhere in `main.css`.** The media queries are eight
`@media print` and one `(hover: none) and (pointer: coarse)` for touch grips. A phone is usable
through pan, pinch and the collapsed sidebar — nothing is laid out for it.

## Drag, drop, and selection (`dnd.ts`)

Block placement on a snapped grid, single selection (`selectedEl`), multi-selection (`selectedEls`
`Set`), marquee band selection (`bandState` + `bandEl`), and multi-drag (`multiDragState` records
original positions so the whole group moves together). `skipNextCanvasClick` suppresses the click
that would otherwise clear a selection right after a band drag ends.

## Persistence (`persistence.ts`)

- **Serialize:** `serializeProject()` walks `state.blocks` and writes plain JSON. For a block from a
  purchased pack it writes `encrypted: true`, `encIv`, `encContent` — **and never the plaintext**.
- **Deserialize:** `loadProject()` rebuilds blocks, then for any block with
  `encrypted && packId && encIv && encContent` fetches the pack key and calls `decryptTemplate()`.
  On success it sets `block.content` and flips `block.encrypted = false` **in memory only**; the
  serializer re-derives the encrypted form from the retained `encIv`/`encContent`.
- Also handles `newProject()`, `newFromTemplate()`, the save-prompt dialog, and custom-tool import.
- Uses the **File System Access API** when available (`state.fileHandle`), which is why saving over
  the same file works in Chromium and falls back elsewhere. A failed write now **says so** and
  clears the stale handle before falling back to a download — it used to degrade silently, so the
  user believed the file on disk had been updated.

### Unsaved-change tracking (v2.6.3, 2026-10-02)

`hasUnsavedChanges()` compares a **fingerprint derived from `serializeProject()`** against the last
point the project was saved, loaded or reset (`markProjectSaved()`).

⚠️ **Deliberately not a `markDirty()` flag set at each mutation site.** There are dozens of those —
every row keystroke, drag, resize, lock, line-spacing change, input value, title-block edit — and a
call missing from one produces the worst outcome available: the program believing work is saved when
it is not. Asking the same function that writes the file cannot miss a mutation. The cost is
serializing on demand, which only happens on New, Load and tab close.

`project_metadata.date` is dropped from the fingerprint — it is stamped with today's date on every
call, so leaving it in would make a project look modified the moment the clock passed midnight.

`confirmDiscardChanges()` is the single gate. It replaced two copies of `if (state.blocks.length >
0)`, which was wrong in **both** directions: it nagged about a freshly opened project nobody had
touched, and it stayed silent when the user had deleted every block — the one case where the unsaved
change _is_ the destruction. If the user picks Save and then cancels the file picker, the action is
aborted rather than proceeding, because nothing was saved.

**Load Project had no prompt at all** before this, unlike New and New from Template. Opening a file
was the one way to lose a sheet silently. A `beforeunload` guard covers closing the tab, where the
browser shows its own wording and the app's dialog cannot be used.

### The project file (2026-09-23)

- **Extension: `.leptonpad`** for new saves; the Open dialog accepts `.leptonpad` **and** `.json`,
  because every project saved before that date uses the old one. `PROJECT_EXT`,
  `PROJECT_PICKER_TYPES` and `PROJECT_ACCEPT_ATTR` live in `types.ts` — one definition, so save and
  open cannot drift. The contents are unchanged: still JSON.
- **Top-level keys:** `project_metadata`, `blocks`, `global_constants`, `custom_tools`,
  `title_block` (only when set), and `page_numbering`.
- **`global_constants` is REPLACED on load, not merged**, and a bare `E` is stripped from it. The
  merge let project A's constants stay in scope for project B; the `E` strip retires the old
  hardcoded Young's-modulus seed. See [`design-decisions.md`](design-decisions.md) and
  [`known-issues.md`](known-issues.md) § 19.
- **Per-row fields on a formula block** live inside `content` (itself JSON): `e`, `d`, `type`,
  `ref`, `sp` (line spacing), `sd` (significant digits), and since v2.5.0 `in` (the stable id of an
  author-declared input row), `uk` (the unit kind that input requires), and `lk` (the row is locked
  against accidental edits). **Anything added here must also be written back by `syncContent()`** or
  it is destroyed on the next keystroke — § 16. The source-guard test for this now reads its field
  list straight off the `FormulaRow` interface, so a new field is covered the moment it is declared.
- **`inputs` on a block** (v2.5.0) — `Record<string, string>`, the values a user typed into input
  rows, keyed by the row's `in` id. It sits at **block level, deliberately outside `content`**,
  because for a pack block `content` is re-emitted as ciphertext and anything inside it is dropped
  on save. Keyed by id and never by row position, so a later template version that inserts a row
  above an input still finds that input's value. An id with no matching row is kept, not pruned.
  See [`security-model.md`](security-model.md) for why writing these in plaintext does not weaken
  the encryption invariant.
- ⚠️ **`loadProject()`'s block literal is an explicit allowlist.** A field written by
  `serializeProject()` but absent from that literal is dropped on load in total silence — which is
  exactly what happened to `lineSpacing` from v2.3.19 until v2.5.0 ([`known-issues.md`](known-issues.md)
  § 21). Adding a `Block` field means editing **both** ends in the same commit.

## PWA layer

- `public/index.html` loads `/config.js` (which sets `globalThis.__LP_CONFIG__`) **before**
  `main.js` — so the Clerk publishable key, the API URL, and the version exist before any module runs.
- `public/manifest.webmanifest` + `LeptonPadLogo.png` make it installable.
- `public/sw.js` precaches `/`, `/main.js`, `/main.css`, `/solver.wasm`, `/config.js`, the manifest,
  and the logo, with a **cache-first** fetch handler. The cache name is `leptonpad-v<version>`, and
  activation deletes every cache whose name differs. **This is the entire cache-busting mechanism**
  — see [`build-and-deploy.md`](build-and-deploy.md).
- Dev never uses that service worker: `dev.ts` writes its own throwaway SW that deletes all caches,
  claims clients, force-navigates open tabs, and is network-only.

## Backend surface — Clerk + API + Neon

Three tiers, each with one job:

```
browser ──Clerk SDK──▶ Clerk              sign in → short-lived session JWT
   │
   └──fetch + Bearer JWT──▶ api/main.ts ──SQL──▶ Neon Postgres
                            verifies the JWT,
                            passes the extracted
                            user id to every function
```

**`src/backend.ts` is the only vendor seam.** Nine methods over two concerns — identity
(`init`, `currentUser`, `onAuthChange`, `signIn`, `signUp`, `verifyEmailCode`, `signOut`) and
entitlement (`getMyRole`, `getPackKey`, `redeemLicenseCode`). No other module in `src/` may import a
vendor SDK; `getBackend()` returns the singleton. That rule is what turned the 2026-08-13 provider
swap into a contained change instead of a refactor, so keep it even though there is one
implementation today.

**The API** (`api/main.ts`) exposes three authenticated routes plus an unauthenticated `/health`:

| Route                    | Calls                            | Returns                                 |
| ------------------------ | -------------------------------- | --------------------------------------- |
| `GET /me`                | `get_my_role(uid)`               | `{ role, trial_expires_at, pack_ids }`  |
| `GET /pack-key?pack_id=` | `get_pack_key(uid, pack)`        | `{ key }`, or 403 when not owned        |
| `POST /redeem`           | `redeem_license_code(uid, code)` | `{ success, message, role?, pack_id? }` |

**Five tables in Neon** — `user_roles`, `license_codes`, `section_packs`, `pack_secrets`,
`user_packs` — with **no RLS**, because no client connects to Postgres. Every function takes
`p_user_id` as its first argument and the API is the only caller.

⚠️ **There is no signup trigger.** Supabase had one on `auth.users` guaranteeing every user a
`user_roles` row; Clerk has no equivalent, so an absent row simply means `free` and nothing may
assume one exists. `get_my_role` reads `user_packs` unconditionally for exactly this reason.

Details in [`auth-and-licensing.md`](auth-and-licensing.md) and [`security-model.md`](security-model.md).
