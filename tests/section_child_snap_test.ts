// ---------------------------------------------------------------------------
// A section child lands on the PAGE grid, the same lattice as every canvas block
// ---------------------------------------------------------------------------
// A child's stored x/y are relative to its section's content box, which starts below the header
// and summary and inside a 4 px border — measured at (76, 605) for a section at (72, 564), against
// a grid whose columns are at 72 + 20n and whose lines are at 24 + 20n. Neither offset is a grid
// multiple, so rounding the CONTENT-RELATIVE value (what `reparentToSection` did) put every dropped
// child 4 px right and 1 px below the lines, and rounding against the CANVAS origin (what
// `unparentFromSection` did) put a child leaving a section 8 px off. "Make sure the blocks land on a
// grid intersection whether in a section space or not" (Jon, 2026-10-07). known-issues § 40.
//
// `snapChildToPageGrid` is the one rule all three paths — drop, drag-end, unparent — now share.

import { assertEquals } from '@std/assert';
import { margins, snapChildToPageGrid, snapToPageColumn, snapToPageGrid } from '../src/state.ts';
import { GRID_SIZE } from '../src/types.ts';

// The section measured in the browser on 2026-10-07.
const CONTENT_LEFT = 76;
const CONTENT_TOP = 605;

const onColumn = (abs: number) => (abs - margins.left) % GRID_SIZE === 0;

Deno.test('a section child snaps against the page grid, not its content box', async (t) => {
  await t.step('a point already on the grid converts exactly, with no rounding', () => {
    // Cursor at (112, 624): column 2, line 30. Content-relative that is (36, 19) — deliberately
    // not multiples of 20, because the content box is not on the lattice.
    const r = snapChildToPageGrid(112, 624, CONTENT_LEFT, CONTENT_TOP);
    assertEquals(r, { x: 36, y: 19 });
    assertEquals(onColumn(CONTENT_LEFT + r.x), true);
    assertEquals(CONTENT_TOP + r.y, snapToPageGrid(624));
  });

  await t.step('the old content-relative rounding is what this replaces', () => {
    // Round (36, 19) to the nearest 20 and you get (40, 20): absolute (116, 625), off both axes.
    assertEquals(onColumn(CONTENT_LEFT + 40), false);
  });

  await t.step('a point between lines goes to the nearest page line', () => {
    const r = snapChildToPageGrid(119, 631, CONTENT_LEFT, CONTENT_TOP);
    assertEquals(CONTENT_LEFT + r.x, snapToPageColumn(119)); // 112
    assertEquals(CONTENT_TOP + r.y, snapToPageGrid(631)); // 624
  });

  await t.step(
    'a line that falls inside the section chrome bumps to the next line, never to 0',
    () => {
      // Column 72 is under the 4 px border and line 604 is above the content top. Clamping to 0
      // would put the child at (76, 605) — between the lines. It goes to column 92 / line 624.
      const r = snapChildToPageGrid(72, 604, CONTENT_LEFT, CONTENT_TOP);
      assertEquals(r.x >= 0 && r.y >= 0, true);
      assertEquals(CONTENT_LEFT + r.x, 92);
      assertEquals(CONTENT_TOP + r.y, 624);
    },
  );

  await t.step('the column snap is the margin lattice, not the canvas origin', () => {
    // 112 is on the margin lattice (72 + 2·20) and NOT a multiple of 20 from the canvas origin.
    assertEquals(snapToPageColumn(112), 112);
    assertEquals(Math.round(112 / GRID_SIZE) * GRID_SIZE, 120); // the unparent path's old answer
  });
});
