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

**Renaming an `in` id: toggle the row off and back on.** There is no rename UI and none is needed
(Jon worked this out, 2026-10-02). The id re-seeds from the current variable name, and the value
survives because it is read back from the row's own text. `uk` is deliberately **kept** across the
toggle — discarding it would make a rename silently relax a validation rule.

Within a sheet an `in` id lives in exactly two places and both are in the same block: the row's
`in` field and the key in `Block.inputs`. There is nothing to propagate, so the rename is local.

⚠️ **The case that does matter is a published pack.** Once a template has been distributed and
buyers hold values keyed to the old id, renaming it in a later version **orphans every one of
them** — silently, because `applyInputOverlay` keeps unmatched ids rather than erroring. That is
the whole reason the id is independent of the variable name. Rename freely before publishing;
after publishing, treat an `in` id as frozen.

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

## Page geometry, overflow and splitting (v2.6.1, 2026-10-02)

**A title block is drawn at the top of EVERY page with `z-index: 2`**, so any block sharing that
space is hidden behind it. Four places decided where a block may sit and they disagreed — only
`moveGridCursor` was right. There is now one definition in `state.ts`: `pageIndexOf()`,
`pageContentTop(pageIdx)` and `clearTitleBlock(top)`, used by the grid cursor, `placeBlock`,
`Canvas.addBlock` and `Canvas.updateMarginGuide` alike.

Two defects it fixed, reported as "blocks getting hidden behind the title block on open":

1. **A section's `y` is stored BELOW the title block** (`placeBlock` subtracts `titleBlockH()`), and
   `addBlock` restored it without adding that height back — so a section saved directly under the
   title block reopened 112 px too high, inside it.
2. **The floor was page 1 only.** `margins.top + tbH` as a single global value left a block near the
   top of page 2 or 3 behind that page's own title block.

⚠️ **`placeBlock` now stores the clamped position, not just the clamped display.** A position
corrected for display but not in the data diverges and comes back wrong on the next open — the same
shape as the `lineSpacing` bug ([`known-issues.md`](known-issues.md) § 21).

### Splitting an over-long block

A block running past its page's bottom margin gets `.block--overflows-page` (dashed amber outline,
suppressed in print) from `markPageOverflow()`, called inside `updatePageCount()` **before** its
early return — overlapping usually does not change the page _count_, so marking after that return
would have shown the marker only when a page was added.

**A marker, not a dialog** (Jon, 2026-10-02): a block can start overlapping because rows were added,
margins changed or the title block was switched on, and interrupting any of those with a modal is
worse than the overlap. The right-click menu carries **"Split at page break"**, shown only when
`canSplitAtPageBreak()` says the block both overflows **and** can legally be cut — an enabled item
that silently no-ops is worse than an absent one.

Splittable types: **formula, summary, text**. A plot or figure has no seam.

**The work area is one definition**: `pageWorkArea(pageIdx)` in `state.ts` returns `{top, bottom,
height}` bounded by the top margin, the title block **and** the bottom margin together. It exists
because "where may content go on this page" was open-coded at each site and every site remembered a
different subset of the three (reported 2026-10-02: _"still not taking into account the margins and
the title block space as part of the active work area"_).

### 🔑 The grid starts below the title block — the root cause of the whole series

Jon, 2026-10-02, after three failed attempts: _"the grid guides should always be below the title
block area."_ That one sentence explains every symptom.

The margin guide was drawn from `margins.top` with a `GRID_SIZE` background. With a title block on
the page, the lines were painted **behind** it, so the first visible line bore no relationship to
where content could begin — and because **`TITLE_BLOCK_H` (112) is not a multiple of `GRID_SIZE`
(20)**, the usable top (136) never coincided with a line (…124, 144…). Every attempt to make a block
land "on the grid" was therefore off by 8 px, and page 2 looked wrong because its guide began at
1080 while its own title block ran to 1192.

The fix is to make the guide **be** the work area: `updateMarginGuide` draws it at
`pageWorkArea(p).top` with `pageWorkArea(p).height`, and `gridOriginOf()` is that same value. So
`firstGridLine(p) === pageWorkArea(p).top` **by construction** — the first line and the first usable
position are one number instead of two that have to be reconciled. Numbers with a title block on
Letter: work 136…1032, lines 136, 156 … 1016.

**The lesson, and it is the fourth instance this session:** two quantities that must agree should be
derived from one another, not computed separately and then reconciled. Three successive fixes failed
because each reconciled the two more carefully instead of collapsing them.

### 🔑 A click is not a drag (v2.6.13)

`pointerdown` always arms `multiDragState`, so **clicking a block to edit it ran the whole
pointerup re-placement** — snapping and rewriting the position of a block that never moved. With
the two lattices below differing by about half a square, that round trip landed on a `.5`, which JS
rounds up, and a click walked the block down a full square.

Jon, 2026-10-02: _"if we are just clicking into the block to edit, we shouldn't be firing any move
commands."_ That is the fix, and it is better than the one I reached for. Making the snap idempotent
(also done, and right on its own terms) only masks it: any future rounding asymmetry moves a block
the user merely looked at, and **a position rewritten on click marks the project dirty for reading
it.** `pointerup` now returns early unless the pointer actually travelled more than 3 px.

### Every placement path snaps, through the same function (v2.6.7, completed v2.6.13)

⚠️ There were **four** copies, not two, and the last two were found one release at a time by Jon
from screenshots:

| Copy                                    | Fixed   | Symptom                                                           |
| --------------------------------------- | ------- | ----------------------------------------------------------------- |
| `Canvas.addBlock` / `updateMarginGuide` | v2.6.7  | blocks half a square off                                          |
| `placeBlock`                            | v2.6.7  | an unsnapped drop is off-grid forever                             |
| `moveGridCursor`'s local `gridOrigin`   | v2.6.13 | the ghost sat on a different lattice than the block would land on |
| `main.ts`'s `mSnapY`                    | v2.6.13 | a click walked a block down a square                              |

The last two survived the v2.6.7 "consolidation" because that pass replaced their **bounds**
(`firstGridY`/`lastGridY`) and left their **origin** behind — a half-consolidation reads as a whole
one. All four now call `snapToPageGrid`.

They were invisible to every test because **the two lattices coincide whenever the title block is
off**, which is what a test sets up by default. `tests/snap_single_source_test.ts` is the guard: no
module outside `state.ts` may reconstruct `pi * PAGE_H + margins.top`, unless the line carries a
`page-origin-ok:` marker with a reason. The one legitimate exemption is the **title block's own
position**, which sits above the work area and genuinely does anchor to `margins.top`. The guard
found both of those on its first run, which is the behaviour wanted — it makes the decision
conscious instead of inherited.

Moving the grid origin to the work-area top exposed a dormant split: **`addBlock` snapped and
`updateMarginGuide` did not.** The disagreement was `(gridOrigin − margins.top) mod GRID_SIZE` —
exactly zero while the origin was `margins.top`, and arbitrary the moment it became the work-area
top with a _measured_ title block in it. Blocks landed half a square off the intersections.

The same offset produced a second symptom that looked unrelated: **the split sized the kept part
against the block's position at computation time, and then the reposition moved the block down
underneath it**, so the part that had been made to fit no longer did. One offset, two bug reports.

`addBlock`, `updateMarginGuide` and `placeBlock` now all go through `snapToPageGrid` vertically and
the same rounding horizontally. `placeBlock` snaps rather than merely flooring because a drag
arrives as a raw pointer delta and the **stored** y is what every later reposition replays — an
unsnapped drop is an off-grid position forever.

`clearTitleBlock` is no longer a parallel rule: since the grid origin became the work-area top,
"below the title block" and "on the first line" are the same position, so `snapToPageGrid` calls it
for its floor instead of repeating the comparison. The test asserts the agreement and idempotence —
replaying a stored position must not drift it further on each reflow — rather than either path
alone, because agreement was the thing that broke.

⚠️ **The margins are not the usable bounds — but the last grid LINE is not the bottom bound either**
(second report, same day:
_"still not respecting the boundary ... past the lined part of the page inside the bottom margin"_
and _"does not understand where to place the top boundary ... in relation to the top lined part of
the next page"_). The margin guide draws a `GRID_SIZE` background starting at `margins.top` on
**every** page, so:

- `firstGridLine(pageIdx)` — **is** `pageWorkArea(pageIdx).top`, where a block's top may first sit.
- `lastGridLine(pageIdx)` — the last line at or above the bottom margin: the lowest a block's **top**
  may sit. **Not the bottom bound.** v2.6.4 used it as one, and that was a category error — the
  lined box extends past the final line (lines 136…1016, box to 1032), and content may fill to the
  box. A block's _bottom_ is bounded by `pageWorkArea().bottom`; a block's _top_ by the lines.
- `snapToPageGrid` clamps to `[firstGridLine, lastGridLine]` **of the page decided once, from its
  input**. 🔑 **Snapping must never relocate a block** — it is the reposition path as well as the
  placement path. Two versions violated that and both produced the same visible symptom, a block
  parked at the bottom-left of the canvas off the lines (reported 2026-10-02):
  - v2.6.7 sent an over-run to `firstGridLine(pi + 1)`, copying `moveGridCursor`. Right for a
    cursor the user is watching; wrong here, because the target page might not exist yet, and
    `updateMarginGuide`'s `CANVAS_H - offsetHeight` clamp then caught it.
  - the floor called `clearTitleBlock(snapped)`, which **re-derives the page from the value handed
    to it** — so rounding up across a page boundary got floored onto the NEXT page's content top
    before the cap could pull it back. The quieter of the two, and the one that actually bit.
    **A helper that recomputes context from its argument cannot be used inside a function that has
    already fixed that context.**
- `snapToPageGrid(top)` — snaps **per page**, because **`PAGE_H` is not a grid multiple either**
  (US Letter is 1056 px). `Canvas.snap()` against the canvas as a whole lands between the lines of
  any page but the first, drifting further down the document. `addBlock` now uses this.

`moveGridCursor` held the only correct copy of this rule all along; it now delegates to the shared
definition, so the cursor, load-time placement and the split all measure against the same lines.
Pinned in `tests/page_geometry_test.ts` — both bounds on-grid, inside the band, and with no slack in
either direction.

Two things that report exposed, both fixed in v2.6.3:

1. **The measurement used `offsetTop`, which was never relative to the block.** ⚠️ My v2.6.3 note
   here claimed the fix was removing a `- base` subtraction so the header would be counted. That was
   wrong, and wrong in a way that read as right for four releases: **`.formula-rows` is
   `position: relative`**, so _it_ is the offsetParent of every row, and `offsetTop` never included
   the label, the divider or the block's `1rem` top padding in the first place. Removing the
   subtraction changed nothing about the header; it just moved the error.

   Fixed in v2.6.8 by measuring **rects relative to the block** —
   `row.getBoundingClientRect().bottom − block.getBoundingClientRect().top` — which does not depend
   on which ancestors happen to be positioned. **The lesson: `offsetTop` is relative to the nearest
   POSITIONED ancestor, and in this codebase that is frequently not the element you mean. Use
   `getBoundingClientRect` deltas for anything measured against a block.**

   The second half of the same bug: `.block` has `padding: 1rem` and a 1px border **below** the last
   row, so a block sized to end exactly at its last row still overruns by 17 px. `chromeBelow` is
   now subtracted from the budget for every candidate. The text path had both holes too.
2. **One cut only.** A block three pages long produced a continuation that itself overflowed the
   NEXT page, so the overflow merely moved down the document.

   `splitAtPageBreak` now drives a **worklist**, not a walk down the chain, because of Jon's
   acceptance criterion (2026-10-02): _"the top left corner of the block and the bottom right corner
   of the block must be within the working grid area of the sheet after the split."_ That is a
   statement about **every** resulting block, so the ORIGINAL is re-examined after each cut —
   splitting shortens it, but the reposition that follows can move it, and a forward walk onto the
   continuation never looks back. Both halves go back on the list; the 60-pass bound is a backstop
   against a measurement that never converges, not an expected limit.

The decision of _where_ to cut is pure and tested (`tests/block_split_test.ts`, 10 steps); only the
measurement needs a DOM:

- `safeSplitIndex(rows, wantIdx)` in `formula.ts` walks back to the nearest depth-0 row that is not
  an `elseif`/`else`/`end`. Splitting between `if` and `end` leaves each half syntactically broken
  **and** the second half depending on variables the first defines.
- `safeTextSplitLine(content, wantLine)` in `text.ts` refuses a cut inside a fenced code block
  (each half would carry an unterminated fence) and will not orphan a heading at the foot of a page.
- **Both return 0 for "cannot split", and callers must not read that as "move everything"** — that
  would empty the original and duplicate it into the new block.

**Both block types are measured, neither is estimated** (v2.6.9 — asked directly: _"Is this setting
now the same for the text block also?"_, and until then the answer was no).

- **Formula** rows are measured individually: row heights vary with line spacing, matrices, wrapped
  descriptions and stacked fractions, so an average would cut in the wrong place on exactly the
  sheets that need this.
- **Text** had no per-line elements to measure, because the renderer emits HTML into a flat list and
  a rendered paragraph cannot be traced back to the source line that produced it. It used to scale
  the line COUNT by the height ratio — which assumes every line is equally tall, and markdown
  violates that constantly (headings, blanks, wrapped sentences, code fences). `fittingLineCount()`
  now renders the first _k_ lines into an **offscreen probe and binary-searches k**: about five
  renders of a small string, exact instead of proportional.

  ⚠️ The probe must live **inside the block** and copy `.md-view`'s class and width. Rendered height
  depends on both, and `.md-view`'s `line-height` reads `--block-line-space`, which is set on the
  block element — a probe parented anywhere else measures a different paragraph.

Both paths share the budget calculation: rects relative to the block, minus `chromeBelow`.

### A split makes room for its continuation (v2.6.10)

The continuation was placed at the next page's first line **on top of whatever was already there** —
so a split could hide a block instead of relocating it (reported 2026-10-02). It now calls the
existing `shiftBlocksVertical()`, the same "insert space" operation Shift+Enter uses, so everything
below moves down as a unit and the spacing the user arranged is preserved.

Four details that make it behave:

- **Measured after render.** The continuation's height is its content's; it cannot be predicted.
- **`exceptId`** — the continuation sits exactly at the threshold, so without excluding it it would
  shift itself out of the gap it just made.
- **Delta = `copyBottom − prevBottom`**, the difference between where the content used to end and
  where it now ends — so each following block keeps its exact gap from the end of the split block.
  ⚠️ v2.6.10 shifted by the continuation's whole HEIGHT instead, which pushed a block that was
  already well down the page onto the next one (reported 2026-10-02 as "aggressive"). A block the
  old block was already overlapping has a _negative_ original gap, so preserving it would preserve
  the overlap; that case falls back to clearing the continuation by one square.
- **Rounded to a whole number of grid squares, away from zero**, so everything below stays on the
  lines. The delta can legitimately be negative — a short continuation pulls the rest back up.
- **Only when something actually collides.** Shifting unconditionally would push content down — and
  possibly add a page — every time a split happened under empty space.

A block pushed down may itself end up overflowing. It is **marked, not auto-split**: the worklist
covers the blocks the split created, not bystanders it moved, which keeps "marker, not modal"
intact. `placeBlock`'s snap floors anything shifted into a title block back out of it.

✅ **Ratified by Jon, 2026-10-02: _"That is a valid compromise."_** Recorded because it is the kind
of gap a later reader mistakes for an oversight and "fixes" — cascading the auto-split into
bystanders would mean one menu click silently rearranging a whole sheet, which is the modal
behaviour this feature was deliberately designed not to have.

`rowDepths()` is exported and the closure inside `buildFormulaBlock` now delegates to it — it was a
byte-identical second copy, and the split needed the same calculation.

### The context menu stays inside the window (v2.6.3, 2026-10-02)

It was placed at the raw `clientX`/`clientY`, so a right-click near the right or bottom edge put
half of it past the viewport — and because `#ctx-menu` is `position: fixed` there is nothing to
scroll to reach the rest. `positionCtxMenu()` in `main.ts`:

- **Shows the menu before measuring it.** `offsetWidth`/`offsetHeight` are 0 while `display: none`,
  so a position computed first would clamp against nothing. It is made visible with
  `visibility: hidden` and revealed once placed, so the move is never seen.
- **Flips to the other side of the cursor** near an edge rather than sliding. Sliding it back under
  the pointer puts the first item beneath the mouse, where a stray click fires it.
- **Clamps after flipping**, since a flip can overshoot the opposite edge when the menu is larger
  than the space on either side.
- **Caps and scrolls** a menu taller than the window. The content varies a lot — spacing, precision
  and formula-row groups appear conditionally — so that is a real case, not a hypothetical.

## Copy and paste (v2.6.1, 2026-10-02)

Right-click **Copy** / **Paste**, and `Ctrl+C` / `Ctrl+V`. They reach the block handler only after
the existing guard returns for an `INPUT` or a contenteditable, so copying **text** inside a formula
cell is untouched.

`state.clipboardBlocks` is an **in-app buffer, not the system clipboard**: a block is a structured
record (rows, units, input values, pack ciphertext) whose only faithful text form is the project
JSON, and round-tripping that through the OS clipboard invites pasting a half-understood blob into a
stamped calculation. Always snapshots — a copy still pointing at the original would paste whatever
the original looks like _now_.

Three things that are easy to get wrong and are handled:

1. **A copied section brings its children**, selected or not. Otherwise copying a section places an
   empty one and loses the calculation inside — noticed only after printing.
2. **`parentSectionId` is remapped through an id map.** Without it the pasted section adopts the
   _original's_ children and leaves the original empty.
3. **`inputs` is deep-copied.** A shallow spread has both blocks sharing one object, so typing a
   value into either changes both.

A child whose parent did not come along becomes a canvas block rather than silently staying attached
to the original section.

## Table block (v2.8.1, 2026-10-02)

**A pure renderer.** It evaluates expressions and draws the result; it never owns data, and typing
into cells is explicitly not a goal (Jon, 2026-10-02). Values come from a matrix expression, so the
same matrix feeds a table, `interp2` and a plot without being written twice.

Five fields, stored as JSON in `block.content`: `title` (spans the full width), `corner` (the label
naming both axes), `cols`, `rows`, `values`. Shape taken from the Cdx reference table Jon supplied.

🔑 **A heading list splices a vector.** `Rows: ba` uses the same vector `interp2` keys on, rather
than the ten numbers retyped — and retyping them is a second copy of the data that can silently
disagree with the first. Scalars, text and vectors mix freely in one comma-separated list.

Headings are optional; a wrong **count** is reported rather than padded or truncated. A table whose
labels have slipped by one column is worse than a table with no labels at all. A `values`
expression that yields a single value is also refused — it is almost always a mistyped variable
name, and rendering a 1×1 table would hide that.

**Units stay per cell**, not hoisted into the heading: they are already in the matrix and a column
is not always unit-consistent.

Tables join `reEvalAllFormulas`'s ordered pass, so one sees the variables defined **above** it —
the same document-order rule every other block follows.

⚠️ **The cycle-avoiding seam.** `table.ts` needs `fmtNum` from `formula.ts`, and `formula.ts` must
call the renderer during evaluation. Importing both ways would close a cycle, so it goes through
two slots: `state.onRenderTable` (formula → table) and `table.onTableChanged` (table → formula),
both wired in `main.ts`. This is what the callback-slot pattern in `state.ts` is for.

**The source strip collapses when you are not working on the block** (Jon, 2026-10-02 — the same
bargain the formula block strikes, where a row shows rendered maths and reveals its source only
when you are in it). Pure CSS, shown on three conditions that are all things the user is already
doing: `.selected`, `:focus-within`, and `.tbl-needs-src` — the last set whenever `values` is
empty, because a block with nothing rendered and a hidden strip would be blank with no clue.

The source fields are edited **in place** and hidden in print. Where a table's numbers came from is
exactly what a reviewer wants to see, so it should not be behind a dialog — but it is plumbing, so
it should not be on the stamped sheet either.

## Heat map block (v2.8.2, 2026-10-02)

Built for plate deflection. Takes the **same three inputs as the table** — values matrix, row
keys, column keys — so a sheet defines the data once and can show it as numbers or as a field.

| Decision | Jon, 2026-10-02                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Cells    | **discrete**, not smoothed — a 10×6 matrix has 10×6 of resolution and a smooth fill implies detail that is not there |
| Contours | **20 bands from lowest to highest**, so 19 interior lines, uniformly spaced                                          |
| Block    | its own type, not a plot mode                                                                                        |
| Print    | colour need not survive, **as long as the contours are labelled**                                                    |

That last one makes **labels load-bearing rather than decorative**: on paper the labels and the
legend range are the only numbers on the map. One label per level, on its longest run, and only
where the run is long enough to hold the text — crowded areas are left clear rather than
overprinted, because 19 labels forced onto a small field hide the contours they describe.

Colour is **anchored at zero** even though the levels are uniform across the range, so the sign of
a deflection reads at a glance; all-positive data then uses one hue, which is the correct reading
rather than a wasted palette.

**Contour geometry lives in `contours.ts`, pure and tested** (`contourLevels`, `marchingSquares`,
`gridRange`). Marching squares is wrong _invisibly_ — a mis-set case gives a plausible field with
its lines in the wrong place — so the saddle resolution, the linear crossing, the divide-by-zero
guard when a level sits exactly on a sample, and the degenerate grids are all pinned against
fields whose contours can be worked out by hand.

🔑 **Hover goes through the same interpolation the calculation uses**, so the number under the
cursor and the contour through that point agree by construction rather than by coincidence.

Samples are the **corners** of the field, so a cell spans between four of them. Drawing each
sample as a patch centred on itself would put half a cell of invented data outside the grid.

Wiring mirrors the table exactly: `state.onRenderHeat` and `heatmap.onHeatChanged`, both wired in
`main.ts`, because `heatmap.ts` needs `fmtNum` from `formula.ts` and `formula.ts` must call the
renderer.

### v2.8.4 — the same entry layout as the table, and it fills the block

**The same five fields in the same order with the same labels** (Jon, 2026-10-02), so moving
between a table and a map needs no re-learning and a table's fields copy straight across. Two read
differently here, which is the cost of the shared layout and worth paying: `cols`/`rows` are the
numeric **key vectors** that scale the axes rather than text headings, and `corner` is split on
its last `/` into the vertical and horizontal **axis labels** — matching how a table's corner
already names both axes.

**Resizes both ways and the field fills it.** ⚠️ Done by recomputing the cell size and redrawing,
**not** by stretching the SVG: `preserveAspectRatio="none"` would scale the axis ticks and contour
labels along with the field, and distorted type on a stamped sheet is worse than a map that is
slightly the wrong shape.

The height lives on `block.h`, so a resized map comes back the size it was left. One
`ResizeObserver` on the output container drives the redraw for both handles and anything else that
changes the size — one path, not two. It compares a rounded size key first, because the redraw it
triggers must not trigger another.

⚠️ `hostHeight()` reads the **inline** height the handle sets, never `clientHeight`: the container
is sized by its content until it has been resized, so measuring it would feed the last drawing's
height back in and let the map creep larger on every render.

### v2.8.6 — marked data points

A sixth source field, `points`: an **m×2 matrix of (row key, column key) pairs**, free position
anywhere on the field, not snapped to a sample. Jon's three calls (2026-10-05): a **field** rather
than hidden config, **free** position, and the value **at the point** with the location **below**
— `(1) 2 in` on the field, `(1) @ b/a = 1.6, x/b = 0.25` in a legend under it. A full coordinate
beside every dot would bury the field it is drawn on.

🔑 **Marks are stored in KEY units, never pixels** — the discipline the plot's `xMarkers` already
follow. A pixel mark is wrong the moment the block is resized or the data changes.

🔑 **`valueAt()` is shared by the hover readout and the marks**, factored out of the hover handler
rather than copied. A mark and the hover at the same place must show the same number, and two
copies of that arithmetic is exactly how they stop doing so.

**`indexOfKey()` locates a key on an axis running either way** — the Cdx rows descend while its
columns ascend — returning a fractional index. ⚠️ Out of range returns `null` and the caller
**says so in the legend**; a mark quietly clamped to the nearest edge would read as a value at a
place the table does not cover.

⚠️ **The legend prints row key first, matching the entry order**, not the `x`-first shape of Jon's
example, so the label doubles as a guide to how the pair is typed. Both axes often span
overlapping numeric ranges, so a flipped pair lands on a real but wrong point with nothing to show
for it.

**`axisLabels` splits the corner on the slash with SPACE around it**, not the last slash — fixed
here, found by a test. The real Cdx corner is `b/a / x/b`: splitting on the first gives `y = "b"`
and on the last gives `x = "b"`, both wrong in opposite directions. A bare slash is part of a
label; only a spaced one is the separator the author typed. Last-slash remains the fallback when
there is no spaced slash.

The point label **flips to the left near the right edge**, as the hover readout already does —
`x/b = 1.0` is the edge of the Cdx table, so marks genuinely land where a rightward-only label
would be clipped.

### v2.8.7 — a way to PLACE the point

⚠️ **v2.8.6 shipped the field and called the feature done.** Jon: _"The user need a way to place
the point. I do not see it yet."_ A field the author can type a pair into is how a mark is
**stored**; it is not how one is **placed**, because placing starts from a spot on the picture and
the author would have had to read the coordinate off the map by eye first. **"Field" answered where
the mark lives, not how it gets there** — the lesson is that a storage decision is not an
affordance decision, and answering one does not discharge the other.

**Right-click the map**, deliberately the plot's gesture and the plot's popup — same layout, same
validate-and-stay-open, so a refused value is corrected rather than retyped and the two blocks are
learned once. The CSS is the plot's rules with `.heat-ctx-*` added to each selector list, not a
second copy that could drift. The menu opens **pre-filled with the keys under the cursor**: the
gesture chooses roughly, the entries make it exact. On an existing mark it offers removal only —
adding a point on top of one is never the intent.

🔑 **The menu writes the FIELD TEXT and keeps no parallel list.** What it places is exactly what
the author could have typed, so a placed mark stays reviewable and editable; `commit()` also
refreshes the strip's input (found by `data-field="points"`), because the field and the marks are
one state shown two ways.

⚠️ **An expression field is refused, never overwritten** (`addPointToSource` /
`removePointFromSource` return `null`). `{{b/a, x_f}}` — a mark that moves when the design moves —
is the version worth having on a real sheet, and rebuilding the field from evaluated numbers would
silently trade that provenance for a frozen literal. Removal splits the literal into **verbatim
top-level groups** for the same reason: deleting one mark must not freeze its neighbour.

Removing the last pair gives an **empty string, not `{{}}`** — a matrix with no rows, which would
render as an error exactly where the author expects to be back where they started.

`keyAtIndex()` is the inverse of `indexOfKey()`, and the round trip is tested both ways on an
ascending and a descending axis: a mark placed by the mouse lands where the cursor was only if the
two agree. Keys are written with `toPrecision(6)` through `String()`, never exponent form, which
the parser rejects.

Out of range is refused **in the menu**, where the ranges are known and the entry is still in front
of the author — unlike a typed pair, which is reported in the legend after the fact.

A right-click in the **margins is not intercepted**, so the block's own menu still opens over the
axis labels.

### v2.8.8 — the legend had nowhere to go

⚠️ **The points legend was rendering and being clipped away.** Since v2.8.4 the field is laid out
to fill the block's whole height, and `.heat-out` has `overflow: hidden` — so every element
appended _after_ the SVG was cut off. The range legend had been disappearing the same way since
v2.8.4 and nobody noticed, because its line is incidental; the points legend is **data**, and Jon
spotted it immediately.

🔑 **The field fills the block MINUS its chrome, and the chrome is measured rather than
estimated.** The title and both legends go into the DOM first, their `offsetHeight` is read, and
the SVG is `insertBefore`'d above them. A per-line estimate is the fallback for a host that
measures 0 (detached or hidden), so the field still leaves room instead of going back to drawing
over the legend. Estimating by default would drift the moment the stylesheet changed.

This forced a split that is worth keeping: **marks are LOCATED before the geometry and DRAWN
after**. Locating needs only the keys and the grid; drawing needs `gx`/`gy`. The legend text is a
product of locating, and the geometry depends on the legend's height — so the old single pass
could not have worked.

`availH` is floored at 80px so a long legend shrinks the field rather than squeezing it away. Past
that floor the chrome genuinely does not fit and the tail of the legend clips; the block wants
dragging taller, and the handle is right there.

⚠️ **Neither clipping bug was visible to a test** — the suite is pure functions and this is
layout. The lesson is cheap to apply though: a fixed-height container with `overflow: hidden` and
a child sized to fill it has **no room for siblings**, so anything appended after is invisible by
construction. Check the render order against the clip whenever either changes.

## Figure placement and movement (v2.11.5 – v2.11.10)

🔑 **Figure numbers are a readout of POSITION, not an identity.** `renumberFigures()` assigns `Fig 1..N`
by upper-left corner, top-to-bottom then left-to-right, from `updatePageCount`. So whatever figure sits
highest IS Fig 1 — you cannot move "Fig 2" above "Fig 1". That reads as a movement lock and is not one;
see [`known-issues.md`](known-issues.md) § 32c.

🔑 **A figure is placed deliberately and is exempt from every auto-layout rule.** `resolveOverlapsRight`
skips them in both roles, `maxLeftFor` lets them sit past the usual right-edge clamp, and `maxWidthFor`
gives them no `max-width` so they are never squeezed narrower the further right they go. Before adding
any rule that moves or resizes a block on its behalf, exempt figures. § 34.

🔑 **A figure is `position: absolute` like every other block, and no `.figure-block` rule may set
`position`.** `.figure-block { position: relative }` beat `.block { position: absolute }` from the
figure's first commit to v2.11.11, which left figures in normal flow: each rendered one figure-height
below the previous one, while `style.left/top` — what every harness read — said it was in the right
place. Guarded by `tests/figure_position_test.ts`. § 39.

🔑 **`freeFigureSlot()` (`dnd.ts`) decides where a new figure lands.** A clear spot is never adjusted —
click an empty point and it lands exactly there. An occupied spot advances RIGHT past what it hit, and
only when nothing fits before `lastGridColumn()` does it wrap to the next row at `margins.left`. That
is what makes repeated double-clicks flow instead of stacking invisibly. § 37. **Inside a section the
obstacles are that section's children and the row ends at its content box** — the section itself is
full width, so treating it as the obstacle sent every repeat placement below it. § 39b.

⚠️ **A figure drags by its whole face.** The image wrapper used to `stopPropagation()` on `mousedown`
so a drag could not start there — and the image area is almost the entire block, so the only draggable
strip was the thin `FIG n` label. That is what "the figures are locked" meant. The caption keeps its
own `stopPropagation` (it is a text field) and the handles keep theirs. § 36.

⚠️ **A section child's stored `x`/`y` are deliberately NOT multiples of `GRID_SIZE`.** They are
content-relative, and a section's content box starts below its header and summary — measured at
`(76, 105)` against a grid origin of `(72, 24)`, so neither axis is a grid multiple. A child at stored
`(36, 119)` is at absolute `(112, 224)`, which IS on the grid. **Never re-snap a child against its
content box**; `addBlock` did and moved every child off the lines on re-render. § 33b. **Every path
that converts a child between content-relative and page coordinates — drop, drag-end, unparent — goes
through `snapChildToPageGrid()` in `state.ts`**, which snaps in absolute px and bumps a line that falls
inside the section chrome to the next one rather than clamping to 0. § 40.

## Resize / stretch handles

All blocks drag-to-reposition on the 20 px snap grid. Beyond that:

| Block             | Right-edge (`w`)            | Bottom-edge (`h`)           |
| ----------------- | --------------------------- | --------------------------- |
| Formula / Summary | ✅ `.formula-resize-handle` | —                           |
| Plot              | ✅                          | ✅                          |
| Figure            | ✅ `.figure-resize-handle`  | ✅                          |
| Section           | ✅                          | ✅ (hidden while collapsed) |

Table and Heat map have a right-edge handle, and Heat map a bottom one, built through their own
`drag()` helper rather than the shared shape above.

Handles use **pointer capture** (`setPointerCapture` + `handle-active` class) and set
`document.body.style.cursor` to `ew-resize` / `ns-resize` for the duration of the drag.

🔑 **Every handle must clamp against `blockMaxBox(el, block, { minW, minH, grid })` (`state.ts`).** A
handle writes `block.w` / `block.h` directly, which **bypasses** the `maxWidth` that `canvas.ts` puts
on an ordinary block — so the lower bound every handle had was the only bound four of the seven had.
Figure, Table and Heat map had no upper bound at all; Plot's and Section's height handles had none.
Print cuts the canvas at the sheet boundary rather than scaling it, so a block dragged across a page
break loses whatever falls past it. Audited and fixed in v2.11.1 — see
[`known-issues.md`](known-issues.md) § 31.

⚠️ **`grid: true` for any handle that snaps its size to `GRID_SIZE`** — Figure, Table, Heat map. It
bounds against `lastGridLine` / `lastGridColumn` instead of the raw margin, because **a bound that is
not itself on a line beats the snap and puts the far edge between lines.** That is what v2.11.1 got
wrong and what "figures snapping to the midpoint of the grid lines" was (§ 32a). Plot and Section pass
no `grid` flag: their sizes are continuous, so the raw margin is the right bound for them.

⚠️ **Snap, then cap — in that order.** Rounding a value UP to the grid can re-cross the bound, so
`snapWithin()` applies the cap after the snap, never before.

🔑 **A handle that changes the HEIGHT must call `onUpdatePageCount?.()` on pointer-up**, because that
is what adds or removes a page and re-runs `markPageOverflow`. Formula's **width** handle calls it
too: narrowing re-wraps the description and reference columns, which makes the block taller without
anything assigning `block.h`.

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
