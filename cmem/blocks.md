# Blocks

`Block.type` (`src/types.ts`) is the union:

```ts
'math' | 'plot' | 'text' | 'header' | 'table' | 'formula' | 'section' | 'summary' | 'figure';
```

`'math'` blocks carry a `subtype` naming the module — `'beam-def'` or `'sect-prop'`. `'table'` is
declared in the union but has no dedicated block module; treat it as reserved, not implemented.

## The catalog

| Block         | File                             | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Formula**   | `blocks/formula.ts` (1059 lines) | The primary surface. Live multi-row evaluation with units, variables, user functions, and control flow. Re-evaluates on `input`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Summary**   | same file, `type: 'summary'`     | A Formula variant with a green accent — **the Section's companion: section-only and pro+** (`sectionOnly` + `requiresPro` in `MODULES`, `main.ts`; v2.2.8, 2026-09-22). History: `dropBlock` always refused a Summary outside a section but did so **silently**, which read as "the block won't place"; v2.2.7 allowed it anywhere, then Jon ruled it meaningless outside a Section (a pro item), so v2.2.8 restored section-only with an explicit alert and added the Pro gate. **Only Summary blocks inside a section feed that section's summary** — Formula blocks do not. Rows that are comparisons (`sigma < F_b`) become pass/fail entries. |
| **Plot**      | `blocks/plot.ts` (1294 lines)    | SVG curve plot over a swept variable, with markers, axis labels, optional area fill, and a live crosshair.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Figure**    | `blocks/figure.ts`               | Image block — paste from clipboard or click to upload; stored as a data URL with a caption.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Text**      | `blocks/text.ts`                 | Markdown block, rendered through `utils/markdown.ts`. The editor lifts the block to `z-index: 30` while open (v2.3.12) so the grown textarea is not covered by a block below it, and drops back on blur.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Header**    | handled in `main.ts`/CSS         | Section heading text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Section**   | `blocks/pro/section.ts`          | Collapsible container with a scoped variable namespace. **pro+ only**, unless it came from an owned pack.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Beam Def**  | `blocks/beam-def.ts` (52 lines)  | Beam deflection — calls `solve_beam_deflection` in WASM.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Sect Prop** | `blocks/sect-prop.ts` (44 lines) | Rectangular section properties — calls `rect_area` / `rect_ix` in WASM.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

Those two math blocks and `src/solver.ts` are the **entire** WASM footprint of the product.

## Formula rows — spacing, navigation, and what a result looks like (2026-09-23)

**Line spacing (1 / 1.5 / 2).** Right-click a row for "Line spacing (this row)", or the block's
label for "Line spacing (whole block)", which **overwrites every row**. Spacing is a property of
the row (`sp` on `FormulaRow`), saved with the project — not a display preference, because a
sheet's layout should look the same on someone else's screen. `1` is never stored. The CSS reads
`--row-space` alone and splits the extra space half above / half below the row. Text blocks have no
rows, so they follow `--block-line-space` on the block element instead (`.md-view` line-height).
Why rows rather than a cascade: [`design-decisions.md`](design-decisions.md).

**Alt+Arrow moves between cells** — left/right through the columns and on into the next row,
up/down to the same column one row away. Alt is the only free modifier, and the handler always
calls `preventDefault` because Alt+Left/Right is the browser's Back/Forward. Two structural traps
it has to respect: `else`/`end` rows **hide** their expression cell, and an `if`/`for` header row
keeps its description and reference **on the group wrapper, not on the row** — so cells are
gathered from the group too and sorted by document position rather than append order.

**The math face is a setting, and old-style figures are the trap.** The sidebar's Math Display
section carries Font, Text size and Sub/superscript, all per browser (`localStorage`), all driving
CSS variables on `:root` — `--math-font`, `--math-text-scale`, `--math-sup-size`. Only OS-resident
faces are offered, because the app must render identically offline.

**Georgia, Palatino and Constantia default to old-style (text) figures**, where 3 4 5 7 9 hang below
the baseline. Handsome in prose, wrong on a calculation sheet — reported 2026-09-23 as "letters and
numbers being shifted down". Two mitigations: every math element sets
`font-variant-numeric: lining-nums` (which fixes any face carrying the `lnum` feature, though
classic Georgia does not), and the default moved to **Cambria** with the offending faces kept but
labelled "low digits". The result column adds `tabular-nums` so successive results align.

**Significant digits are per row too** (`FormulaRow.sd`, v2.3.32) — right-click a row, or the
block label to stamp every row, choosing 3 / 4 / 6 / 8 / 10. `SIG_DEFAULT` is 6 and is never
stored. **Display only**: `fmtNum` rounds the rendering, the stored value stays a full double, and
the result's tooltip shows it unrounded. `fmtNum` also groups thousands uniformly now — it used to
group only whole numbers, so `1234567.891` rendered as `1234570`.

**What the result column shows.** A result is set in the same serif face, size and colour as the
expression that produced it — it is part of the calculation, not a separate kind of thing. Only a
status earns a colour: `err` in red, and a comparison as a green **OK** or a red **NG**, driven by
`Statement.isTest`. The `if`/`elseif` branch markers deliberately keep `▶ true` / `▷ false`: they
report which branch executed, not whether a design check passes.

## Input rows and locks (v2.5.0, 2026-09-23)

**An input row is a field the reader fills in.** The variable name renders locked in its own
column; only the value is editable, and it stays editable however locked the rest of the block is.
That is the whole point of declaring one — it is what makes a purchased template usable without
opening the template itself. Three fields on `FormulaRow`:

| Field | Meaning                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------- |
| `in`  | the author's **stable id** for this input — seeded from the variable name, independent of it from then on |
| `uk`  | the unit kind the value must be, a key of `CATEGORY_DIMENSION` (optional)                                 |
| `lk`  | this row is locked against accidental edits                                                               |

**The values live on the block, not in the row** — `Block.inputs`, keyed by `in`. See
[`architecture.md`](architecture.md) for the format and [`security-model.md`](security-model.md)
for why that placement is what lets a licensed pack work at all.

**A value must be a literal**: a number or a `{…}` vector, either with an optional `[unit]`. A
formula is refused, and the field is outlined red with the reason in its tooltip — the entry is
still recorded rather than discarded, so nothing the user typed is lost. `uk` is checked
**dimensionally**, so a `force` input takes kip, kN or lbf alike; an unrecognised `uk` in a template
is ignored rather than locking the user out of their own sheet.

**Authoring**: right-click a row → **"make input row"**. The id is seeded from the variable name and
the unit kind is **inferred from the unit already typed** (`10 [kip]` → force), so the common case
asks nothing. A dropdown then adjusts the requirement. Offered only on a named, non-control row —
`if`/`for` take a condition, not a value.

**Two locks, different in kind.** `🔒 lock row` in the row menu is **accident protection**: it stops
a reader tabbing through a sheet and retyping a coefficient. It is a flag in a file on the user's
own disk, so it is not access control, and it must never be described as though it were. A locked
row renders normally, refuses focus, drops out of Alt+Arrow navigation, and **hides its own delete
button** — deleting it is the accident the lock exists to prevent.

The **pack lock** is the other kind: every row of a block from a purchased pack is read-only except
its declared inputs, resolved through the parent section so child formula blocks are covered. It is
not enforced by a flag but by the plaintext never reaching disk. It also closed the last audit lead
— those edits were always discarded on save, and refusing them is the honest version of that. See
[`design-decisions.md`](design-decisions.md) § Two locks.

⚠️ **Untested end to end**: nothing in the tree sets `packId` yet, so no one has opened a real pack
block — [`known-issues.md`](known-issues.md) § 22.

## Resize / stretch handles

All blocks drag-to-reposition on the 20 px snap grid. Beyond that:

| Block             | Right-edge (`w`)            | Bottom-edge (`h`)           |
| ----------------- | --------------------------- | --------------------------- |
| Formula / Summary | ✅ `.formula-resize-handle` | —                           |
| Plot              | ✅                          | ✅                          |
| Figure            | ✅ `.figure-resize-handle`  | ✅                          |
| Section           | ✅                          | ✅ (hidden while collapsed) |

Handles use **pointer capture** (`setPointerCapture` + `handle-active` class) and set
`document.body.style.cursor` to `ew-resize` / `ns-resize` for the duration of the drag.

⚠️ **CSS hover rule:** reveal handles with `.block:hover .handle`, **never** `.formula-block:hover`.
Every block element carries the shared `.block` class; the type-specific selectors do not fire
reliably for hover-reveal. This is a rule that was paid for — see [`conventions.md`](conventions.md).

## Section blocks

- **Variable scoping.** A section's `sectionName` becomes a prefix: `beam1` → variables stored as
  `beam1__L`. The separator is a **double underscore**, and `sanitizeSectionName()` collapses runs of
  underscores (`/__+/g → '_'`) precisely so a user-typed name can never forge a namespace separator.
- **Names are unique.** Renaming checks every other section block and reverts the title element if the
  candidate collides. `nextSectionName()` generates the default (`section1`, …).
- **Rendering is not gated; only creating is** (v2.4.2). `buildSectionBlock` used to refuse to render
  a section for a user without creation rights, so opening a file someone sent you showed
  "Pro required to create sections" across the block — the sheet could not be read or printed, which
  is the opposite of what a feature tier is for. **Receiving a calculation sheet is not creating
  one.** Creation is still gated where creation happens: both placement paths in `main.ts` test
  `dataset.requiresPro && !canCreateSection()`, and the sidebar marks the module locked. Gating it a
  third time at render bought nothing and cost every reader the content. A pack section the user does
  **not** own is still withheld — that is licensing, not a tier.
- **Flat storage, logical nesting.** Children are not nested in `state.blocks`; each child carries
  `parentSectionId`. `state.childToSection` is the runtime reverse index, rebuilt on load and never
  persisted.
- **Collapse.** `block.collapsed` toggles the `.collapsed` class on the content element. Height
  recalculation **skips collapsed sections** — a `ResizeObserver` firing during hide/show produced
  wrong heights, so the guard is deliberate. The bottom resize handle is hidden while collapsed.
- **Access gate** (`blocks/pro/section.ts`, ~line 248):
  - a section **without** `packId` requires `canCreateSection()` → `super`/`pro`/`demo`;
  - a section **with** `packId` renders for anyone who `hasPack(packId)`;
  - otherwise the block renders the placeholder `[Pack "<id>" not owned]`.
    This is a **UI gate, not the security boundary** — see [`security-model.md`](security-model.md).
- `sectionColor` sets the left accent border.

## Summary mechanics

`sectionSummaryVarNames: Map<sectionElId, Map<name, spellingAsTyped>>` and
`sectionSummaryComparisons: Map<sectionElId, Array<{expr, pass}>>` in `state.ts` are rebuilt by
`formula.ts` whenever a section's children are evaluated. The as-typed spelling (e.g. `\phi_P_nr`)
lets `updateSectionSummary` render the line through `transformPiece`/`prettifyExpr` (v2.2.6). A comparison row's `pass` is simply
`stmt.value !== 0` — the evaluator returns 1/0 for a boolean expression.

## Plot block

`PlotConfig` (`types.ts`) carries `expr`, `xVar` (default `'x'`), resolved `xMin`/`xMax`, the **raw**
`xMinExpr`/`xMaxExpr` (which may name a scope variable, not just a literal), `nPts` (default 200),
axis labels, `xMarkers`/`yMarkers`, and `fill`. `DEFAULT_PLOT` is `sin(x)` over `0 … 6.2832`.

**Sweep-variable units.** The plot injects the sweep variable carrying the unit taken from the
non-trivial range bound — `xMax` preferred, then `xMin`, then dimensionless. So plotting `delta(x)`
from `0` to `l [ft]` evaluates with `x` in `{ft}`, keeping a polynomial like `l^3 - 2·l·x² + x³`
dimensionally consistent. Without this, half the terms would carry units and half would not, and
`addU` would (correctly) reject the expression.

**Two ways to place a marker**, both set from the right-click popup, both persisted in `PlotConfig`,
and both rendering as the same thing — a pink diamond on the curve labelled `(x, y)`:

| Field                | User asks                                    | Resolved by                         |
| -------------------- | -------------------------------------------- | ----------------------------------- |
| `xMarkers: number[]` | "put a node where x = 4.2"                   | Evaluating the expression at that x |
| `yMarkers: number[]` | "put a node where the curve reaches y = 0.5" | `findCurveCrossings()`              |

**Label placement — `labelLy()`, shared by user nodes and extrema.** The area fill shades between the
curve and `y = 0`, so a label always goes on the **far side from the axis**: above a point at or above
zero, below one under it. Keyed on the **sign of the value, not max/min** — a local minimum sitting
above the axis still has shading beneath it, and a maximum in a wholly negative curve still has
shading above. Extrema used the max/min rule until 2026-08-13 and put both of those cases inside the
fill. The `+12` below versus `−5` above is baseline compensation: SVG text hangs below its `y`.

User nodes keep a horizontal offset of 7 against the extrema's 4, because the diamond is half-width 5
against the circle's radius 3 — matching the number would tuck the text under the glyph rather than
match the visual gap.

**User node labels stay on ONE line wherever they fit** — `(4.20, 5.00)`. Only when that would run off
the canvas does the label fold to two, `(4.20,` over `5.00)`, which reads as the same ordered pair and
so needs no `x=`/`y=` prefix. Folding roughly halves the width, buying back the room before the side
has to change.

`nodeLabel()` degrades in a fixed order, most important first:

1. **the slope-derived side**, so the label stays clear of the curve;
2. **the single-line form**, because it is tidier;
3. **anything on the canvas**, rather than text running off the edge.

Measured over 61 positions on a rising curve: **58 single-line, 3 folded near the edge, 0 that gave up
the correct side, 0 off-canvas.** Before folding existed, the width alone forced the wrong side across
roughly the leftmost fifth of the plot.

Extrema and zero crossings deliberately keep their single-line label and `clampLy` — auto-annotations
at slope ~0 whose placement was already settled, and restacking them would churn every existing plot
for no gain.
**Horizontal side follows the local slope**, so the label lands where the curve isn't. Given
`labelLy()` has already chosen above/below:

| Value                 | Curve rising                              | Curve falling |
| --------------------- | ----------------------------------------- | ------------- |
| `y ≥ 0` (label above) | **left** — the curve occupies above-right | **right**     |
| `y < 0` (label below) | **right**                                 | **left**      |

Written as one XOR (`(slope >= 0) !== (yv < 0)`) rather than two branches, because the
below-the-axis cases are the exact mirror. `localSlope()` reads dy/dx from the two samples straddling
the node and returns 0 where the slope is undefined — off the ends, across a NaN gap, on a zero-width
segment — so the caller never sees `Infinity`.

⚠️ **The side rule is overridden only to stop text leaving the CANVAS**, not merely to keep it inside
the axis rectangle. Labels carry no clip-path — only the curve does — so overhanging into the margin
is fine. Guarding against the plot rect instead cost roughly the left fifth of the width, and a rising
curve near `x = 0` (the normal start of a deflection plot) got forced to the wrong side, making the
rule look inverted. With stacked labels the override now fires essentially never: a rising curve holds
LEFT at all 41 sampled positions across the full width.

Extrema keep a fixed side: their slope is ~0 by definition, so the rule cannot discriminate and both
sides are equally clear.

**Right-clicking a node offers only "Clear current point".** The context menu branches on a hit test
(`markerAt()`, 8 px radius, scanned newest-first so the most recently added node wins an overlap): on
a node it shows the delete option, anywhere else the add-x/add-y popup. Hovering a node sets
`cursor: pointer` and a tooltip so the target is findable rather than hidden.

**A y entry is a way of FINDING points, not a point itself.** On Add it resolves to its crossings and
pushes each one into `xMarkers` as its own entry; `yMarkers` is never written. Once found, a crossing
is simply a node on the curve — exactly what an x marker is — so every node gets its own identity and
one can be deleted without touching its siblings. Storing the y request whole made that impossible,
since four nodes shared a single config entry.

⚠️ **Trade-off, deliberate:** a node placed via a y entry stays at its x and follows the curve
vertically (`y = f(x)` re-evaluates). It does **not** re-hunt for the original y value if the
expression changes.

`evalPlotData` returns **`markerSrc`** parallel to `markerData` — index `i` says which config entry
drew node `i`. Keep the two arrays pushed in lockstep; a node's coordinates alone cannot be traced
back to the entry to remove.

Plots saved while y requests were stored whole are upgraded on first render: each is resolved to its
crossings, folded into `xMarkers`, and persisted. It runs once — `yMarkers` is empty afterwards, so
the re-render cannot loop.
**Only these two persist, and only these two are cleared.** Zero crossings (teal) and local
maxima/minima (amber/red) are **derived from the sampled points on every render and never stored**,
so `Clear All` structurally cannot disturb them — there is no state to disturb.

`yMarkers` was added 2026-08-13, and `markers` was renamed `xMarkers` for symmetry at the same time.
**`yMarkers` is the mirror of `xMarkers`, not a reference line** — an early version drew a horizontal
limit line, which was the wrong reading of the request.

⚠️ **`parsePlotConfig()` is the single parse site and owns the `markers` → `xMarkers` migration.**
Its guard must test the RAW parsed object, not the merged one: `DEFAULT_PLOT` seeds `xMarkers: []`,
so checking the merged config always finds an array and the migration never fires — silently dropping
the markers from every project saved before the rename. That exact bug was written and caught by the
round-trip test, not by the type checker.

**Both are one-to-many in principle, but only `yMarkers` actually is.** `y = f(x)` is single-valued,
so an x can only ever produce one node. A y can produce several — `sin(x)` over `0…4π` crosses
`y = 0.5` four times, and all four get nodes. `findCurveCrossings()` walks adjacent samples for a
sign change in `y - target` and interpolates within the straddling segment, so a node lands visually
on the drawn polyline at the same resolution the polyline has.

⚠️ **Its exact-hit handling is deliberate.** A sample sitting exactly on the target is emitted when
it is a segment _start_ and skipped as a segment _end_, or it would be counted twice. The final
sample gets its own check because the loop only inspects starts.

**Entries are validated before they are accepted**, with the popup left open and the value intact so
it can be corrected:

| Rejected when                      | Message                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| x outside the plotted range        | `Point is out of bounds — x range is …`                    |
| y the curve never reaches          | `Point is out of bounds — the curve never reaches that y.` |
| duplicates an existing user marker | `A point at x = … already exists.`                         |
| duplicates a drawn extremum        | `A local maximum is already marked at x = …`               |
| duplicates a drawn zero crossing   | `A zero crossing is already marked at x = …`               |

Three things make this correct rather than merely present:

1. **Comparison is by proximity, one sample spacing** (`(xMax - xMin) / nPts`), not equality. An
   auto-annotation sits at an arbitrary float nobody could retype exactly, and two points closer than
   one sample render on top of each other anyway.
2. **Auto-annotations only count when actually drawn.** Past `MAX_ANNOT` (14) the renderer suppresses
   them, and refusing a user's point for colliding with something invisible would be indefensible —
   hence the shared module-level constant rather than a copy in each place.
3. **The validator and the renderer call the same functions** — `findLocalExtrema()` and
   `findCurveCrossings(points, 0)`. Both were inline duplicates inside `buildPlotSVG` until
   2026-08-13; two copies would drift and the symptom would be the popup rejecting points that are
   not on screen. A zero crossing _is_ a curve crossing at `y = 0`, so it reuses the y-marker routine
   outright.

The popup opens with **both** fields pre-filled from the click point — `x =` on top, `y =` below —
each with its own Add. `Clear All` clears both lists.

**Rendering.** The plot body is built as an **SVG string** (`'<svg …>' + …`) and injected; the
interactive crosshair group is then created with `document.createElementNS`. Two different DOM
strategies in one file, on purpose: the static plot is cheap to rebuild wholesale, the crosshair must
be mutated per pointer-move.

## Custom modules (user-defined tools)

`CustomModule` (`types.ts`) lets a user save a block arrangement as a reusable sidebar tool.

- The modern form is `blocks[]`, each entry holding `type`, `subtype`, `content`, `label`, `w`, and a
  `dx`/`dy` **pixel offset from the top-left block's canvas position** — so a multi-block tool drops
  as a group with its relative layout intact.
- `content` and `label` at the top level are **legacy single-formula fields, kept for backward
  compatibility**. Do not remove them; old saved tools still use them.
- Stored in `localStorage` under `CUSTOM_MODULES_KEY = 'mathwasm-custom-modules'` — a name inherited
  from the project's pre-rename "MathWasm" era. **Renaming that key would orphan every user's saved
  tools.** See [`known-issues.md`](known-issues.md).
- Import/export of tool sets lives in `persistence.ts` (`importToolsFromFile`,
  `showImportToolsDialog`).
