# Blocks

`Block.type` (`src/types.ts`) is the union:

```ts
'math' | 'plot' | 'text' | 'header' | 'table' | 'formula' | 'section' | 'summary' | 'figure';
```

`'math'` blocks carry a `subtype` naming the module — `'beam-def'` or `'sect-prop'`. `'table'` is
declared in the union but has no dedicated block module; treat it as reserved, not implemented.

## The catalog

| Block         | File                             | What it does                                                                                                                                                                                             |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Formula**   | `blocks/formula.ts` (1000 lines) | The primary surface. Live multi-row evaluation with units, variables, user functions, and control flow. Re-evaluates on `input`.                                                                         |
| **Summary**   | same file, `type: 'summary'`     | A Formula variant with a green accent. **Only Summary blocks inside a section feed that section's summary** — Formula blocks do not. Rows that are comparisons (`sigma < F_b`) become pass/fail entries. |
| **Plot**      | `blocks/plot.ts` (737 lines)     | SVG curve plot over a swept variable, with markers, axis labels, optional area fill, and a live crosshair.                                                                                               |
| **Figure**    | `blocks/figure.ts`               | Image block — paste from clipboard or click to upload; stored as a data URL with a caption.                                                                                                              |
| **Text**      | `blocks/text.ts`                 | Markdown block, rendered through `utils/markdown.ts`.                                                                                                                                                    |
| **Header**    | handled in `main.ts`/CSS         | Section heading text.                                                                                                                                                                                    |
| **Section**   | `blocks/pro/section.ts`          | Collapsible container with a scoped variable namespace. **pro+ only**, unless it came from an owned pack.                                                                                                |
| **Beam Def**  | `blocks/beam-def.ts` (52 lines)  | Beam deflection — calls `solve_beam_deflection` in WASM.                                                                                                                                                 |
| **Sect Prop** | `blocks/sect-prop.ts` (44 lines) | Rectangular section properties — calls `rect_area` / `rect_ix` in WASM.                                                                                                                                  |

Those two math blocks and `src/solver.ts` are the **entire** WASM footprint of the product.

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

`sectionSummaryVarNames: Map<sectionElId, Set<string>>` and
`sectionSummaryComparisons: Map<sectionElId, Array<{expr, pass}>>` in `state.ts` are rebuilt by
`formula.ts` whenever a section's children are evaluated. A comparison row's `pass` is simply
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
