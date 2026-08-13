# Design Decisions

Each entry is a choice that looks wrong or arbitrary until you know why. Do not undo one without
reading its reason.

## Why the math engine is TypeScript, not WASM

The project name and repo location (`wasmExamples/`) suggest a WASM-first design. It is not, and that
is deliberate:

- **Unit conversion is a lookup plus one multiply.** Moving it to WASM adds async module load, a
  JS↔WASM boundary crossing per call, and no tree-shaking benefit for a lookup table. The TypeScript
  in `src/utils/unit-defs.ts` is the correct fit.
- **The evaluator is string- and object-heavy.** `expr.ts` deals in tokens, `UnitMap` records, and
  scope dictionaries. That is exactly the workload where WASM's numeric advantage evaporates and the
  marshalling cost dominates.
- **What WASM is actually used for** is the right shape for it: three pure `f64 → f64` arithmetic
  functions in `solver/solver.ts` (`rect_area`, `rect_ix`, `solve_beam_deflection`), compiled by
  `jsr:@jrmarcum/wasmtk`.

The `// WASM-READY: (f64, …) -> f64` comments in `units.ts`, `formula.ts`, and `plot.ts` mark
functions whose signatures _would_ survive the promotion. They are documentation of a possibility, not
a plan. **Do not treat a `WASM-READY` marker as a TODO.**

## Compound units expand to primitives — and the display side effect is correct

`parseUnitExpr()` expands `ksi` to `{kip:1, in:-2}` so that `E * I [in^4]` cancels to `kip·in²`
instead of accumulating a nonsense `ksi·in⁴`. Cancellation across compound units is impossible
without this.

**The side effect: intermediate results display the expanded form** (`kip/in²`, not `ksi`). This has
been reported as a bug and it is not one. If a user wants `ksi` on a specific row, `[[ksi]]` puts it
there. Re-collapsing units for display would require a reverse-lookup heuristic that is ambiguous in
general (`kip/in²` is also `ksi`, `1000 psi`, …) and would occasionally lie.

## `[[targetUnit]]` on a function is applied per call, not at definition

`FnScope` stores `targetUnit?: UnitMap` next to the expression, and **both call sites in
`Parser.atom()`** apply `applyTargetUnit()` after evaluating the body. Converting at definition time
would bake in whatever units the arguments happened to have on the defining row; converting per call
is what makes `delta(x) = expr [[in]]` behave the way an engineer expects for any `x`.

## The plot sweep variable inherits its unit from the range bound

The plot block injects the sweep variable with the unit taken from the non-trivial bound — `xMax`
preferred, then `xMin`, then dimensionless. Reason: expressions like `l^3 - 2·l·x² + x³` mix the
sweep variable with scope variables that carry units. If `x` were dimensionless, `addU` would
(correctly) reject the sum. `xMin` is usually `0`, which is why `xMax` is preferred as the unit
source.

## `state.ts` is a mutable singleton with `let` + setters

No store, no reducer, no injection. Chosen for a single-user, single-document, browser-only app where
the alternative would be ceremony without benefit. The costs are known and managed:

- ES modules forbid external assignment to an imported binding, hence the `setX()` pairs.
- `canvas` and `bandEl` are `null!` with a documented "assigned in `start()`" contract.
- Cross-module behavior goes through **callback slots** (`onSelectBlock`, `onUpdatePageCount`, …)
  rather than imports, so no cycle ever closes. `CanvasLike` is a structural type for the same reason.

## `TITLE_BLOCK_H = 112` is a constant, never measured

The comment in `types.ts` says it outright: "Never measured from DOM to avoid layout-timing bugs."
Reading the height back from the DOM returns a pre-layout value at the moment the code needs it, and
the resulting off-by-N pushed every block on the page. 112 = 4 rows × 28 px. If the title block's row
count or row height changes, **change the constant**, do not start measuring.

## Section height recalculation skips collapsed sections

`ResizeObserver` fires while a section is being hidden/shown and reports transitional heights. The
guard (`if (!content || content.classList.contains('collapsed')) return;`) is the fix. Removing it
brings back sections that resize to the wrong height on toggle.

## `globalThis`, never `window`

Deno's linter flags `window` as unavailable, and the same source is bundled for the browser.
`globalThis` works in both. Applies to everything: `globalThis.prompt(...)`,
`globalThis.__LP_CONFIG__`, `globalThis.localStorage`.

## Runtime config is injected, not bundled

`public/index.html` loads `/config.js` **before** `main.js`, setting `globalThis.__LP_CONFIG__` with
the Clerk publishable key, the API base URL, and the version. That lets the same bundle be deployed
against different backends, and lets the host inject values from environment variables at build time.
`neon-clerk.ts` reads it with a `?? {}` fallback so the app still loads (offline, unauthenticated)
when config is missing.

The generator is `scripts/write-config.ts`, deliberately a **single** function shared by `build.ts`
and `dev.ts` — they previously carried near-identical copies that could silently drift.

## A failed entitlement sync is shown, never silently downgraded

`auth.ts` falls back to cached entitlements when the server is unreachable, so a network blip never
locks anyone out of their own sheets. That part is right. What was wrong until 2026-08-13 is that
**"the server says you are free" and "I could not reach the server" rendered identically** — a paying
customer with a dropped connection saw `Free — no packs` and watched their purchased sections
disappear, with nothing on screen explaining it.

`entitlementsStale` and `lastSyncedAt` now record which of the two happened:

- **Synced** — render normally.
- **Stale, with a previous sync** — render the cached role plus `· offline, synced 3 hours ago`, and
  dim the badge. Cached access still applies.
- **Stale, never synced** — render `Unverified` and `Offline — access not yet verified`. Claiming
  `free` here would assert a fact we do not have.

The pro gate follows the same rule: when stale it says _"Couldn't verify your account"_ with a
**Retry**, not _"buy Pro"_ — telling someone who already pays to purchase what they own is the worst
possible reading of a network error. An `online` listener re-syncs automatically so recovery needs no
reload.

⚠️ **Gating itself stays strict when stale.** Being unable to verify is not permission — leniency
here would mean going offline grants Pro. The fix is to explain, not to open the gate.

## Blocks are stored flat; section membership is a field

`state.blocks` is a flat array and a child block carries `parentSectionId`. Nesting would complicate
z-order, drag-and-drop hit testing, serialization, and the top-to-bottom evaluation order that the
whole math model depends on. `childToSection` is the runtime reverse index, rebuilt on load and never
serialized.

## Section namespaces use `__` and names are sanitized

`sectionName` → `beam1__L`. `sanitizeSectionName()` collapses runs of underscores (`/__+/g → '_'`) so
a user-chosen section name can never forge the namespace separator and collide into another section's
variables.

## The plot is an SVG string, the crosshair is DOM nodes

`plot.ts` concatenates the static plot as an SVG string (cheap to rebuild wholesale on any config
change) and then attaches the interactive crosshair with `createElementNS` (must be mutated per
pointer-move without re-serializing the plot). Two strategies in one file, on purpose.

## The dev server shuts down when the browser tab closes

An SSE endpoint (`/__dev_sse`) with a **5-second grace period**: tab close aborts the stream and arms
a shutdown timer; a refresh reconnects and cancels it. Chosen so `deno task dev` does not leave an
orphaned server and bundler behind on a Windows dev box. The grace period exists specifically so a
refresh does not kill the session.
