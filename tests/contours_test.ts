// ---------------------------------------------------------------------------
// Contour geometry
// ---------------------------------------------------------------------------
// Marching squares is wrong invisibly: a mis-set case produces a plausible field with its lines
// in the wrong place, which on a stamped sheet is exactly the failure that gets past review. So
// the geometry is checked against fields whose contours can be worked out by hand.

import { assertAlmostEquals, assertEquals } from '@std/assert';
import { contourLevels, gridRange, marchingSquares, type Segment } from '../src/blocks/contours.ts';

/** Sort segments into a stable order so a comparison does not depend on scan order. */
const norm = (segs: Segment[]) =>
  segs
    .map((s) =>
      s.x1 < s.x2 || (s.x1 === s.x2 && s.y1 <= s.y2)
        ? [s.x1, s.y1, s.x2, s.y2]
        : [s.x2, s.y2, s.x1, s.y1]
    )
    .map((a) => a.map((n) => +n.toFixed(6)).join(','))
    .sort();

Deno.test('contour levels', async (t) => {
  await t.step('20 bands give 19 interior lines, evenly spaced', () => {
    const l = contourLevels(0, 20, 20);
    assertEquals(l.length, 19);
    assertAlmostEquals(l[0], 1, 1e-9);
    assertAlmostEquals(l[18], 19, 1e-9);
  });

  await t.step('the ends are excluded', () => {
    // A contour exactly at the min or max touches the field at a point or an edge and draws as
    // noise rather than information.
    const l = contourLevels(-5, 5, 20);
    assertEquals(l.includes(-5), false);
    assertEquals(l.includes(5), false);
    assertAlmostEquals(l[9], 0, 1e-9); // a symmetric range still puts a line on zero
  });

  await t.step('a flat or degenerate field has no contours', () => {
    assertEquals(contourLevels(3, 3), []);
    assertEquals(contourLevels(5, 1), []);
    assertEquals(contourLevels(NaN, 1), []);
  });
});

Deno.test('marching squares', async (t) => {
  await t.step('a single cell crossed left-to-right', () => {
    // Top row below, bottom row above → one horizontal segment halfway down both side edges.
    const g = [[0, 0], [10, 10]];
    assertEquals(norm(marchingSquares(g, 5)), ['0,0.5,1,0.5']);
  });

  await t.step('a single cell crossed top-to-bottom', () => {
    const g = [[0, 10], [0, 10]];
    assertEquals(norm(marchingSquares(g, 5)), ['0.5,0,0.5,1']);
  });

  await t.step('the crossing is linearly interpolated, not placed at the midpoint', () => {
    // 0 → 10 crossed at 2 is a fifth of the way along, not halfway. Getting this wrong puts every
    // contour on a cell boundary and makes the field look stepped.
    const g = [[0, 0], [10, 10]];
    assertEquals(norm(marchingSquares(g, 2)), ['0,0.2,1,0.2']);
  });

  await t.step('a corner cuts the two edges that meet at it', () => {
    const g = [[10, 0], [0, 0]]; // only the top-left is above
    assertEquals(norm(marchingSquares(g, 5)), ['0,0.5,0.5,0']);
  });

  await t.step('wholly above or wholly below yields nothing', () => {
    assertEquals(marchingSquares([[1, 1], [1, 1]], 5), []);
    assertEquals(marchingSquares([[9, 9], [9, 9]], 5), []);
  });

  await t.step('a saddle produces TWO separate segments, not one crossing the cell', () => {
    // Opposite corners high. The wrong pairing joins the wrong edges and merges two contours into
    // one line that cuts across the field — the classic marching-squares bug.
    const segs = marchingSquares([[10, 0], [0, 10]], 5);
    assertEquals(segs.length, 2);
    // Each segment must join two DIFFERENT edges of the cell, never span corner to corner.
    for (const s of segs) {
      const onEdge = (x: number, y: number) => x === 0 || x === 1 || y === 0 || y === 1;
      assertEquals(onEdge(s.x1, s.y1) && onEdge(s.x2, s.y2), true);
    }
  });

  await t.step('a level exactly on a sample does not divide by zero', () => {
    // Two equal corners straddling the level would give NaN, which SVG renders as nothing —
    // silently losing part of a contour rather than reporting anything.
    for (const s of marchingSquares([[5, 5], [0, 10]], 5)) {
      assertEquals(Number.isFinite(s.x1) && Number.isFinite(s.y1), true);
      assertEquals(Number.isFinite(s.x2) && Number.isFinite(s.y2), true);
    }
  });

  await t.step('a grid too small to have a cell is handled, not crashed', () => {
    assertEquals(marchingSquares([], 1), []);
    assertEquals(marchingSquares([[1, 2]], 1), []);
    assertEquals(marchingSquares([[1], [2]], 1), []);
  });

  await t.step('a plane produces one straight contour across the whole grid', () => {
    // f = x, so the level-1.5 contour is the vertical line x = 1.5 through every row.
    const g = [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]];
    const segs = marchingSquares(g, 1.5);
    assertEquals(segs.length, 2); // two rows of cells
    for (const s of segs) {
      assertAlmostEquals(s.x1, 1.5, 1e-9);
      assertAlmostEquals(s.x2, 1.5, 1e-9);
    }
  });
});

Deno.test('grid range ignores holes', () => {
  assertEquals(gridRange([[1, 2], [NaN, 4]]), { min: 1, max: 4 });
  assertEquals(gridRange([[-3, 0], [2, 10]]), { min: -3, max: 10 });
});
