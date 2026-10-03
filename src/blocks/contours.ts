// ---------------------------------------------------------------------------
// Contour geometry — pure, no DOM
// ---------------------------------------------------------------------------
// The heat map's drawing needs a browser; deciding WHERE the lines go does not. Marching squares
// is the kind of thing that is wrong invisibly — a mis-set case table produces a plausible-looking
// field with the lines in the wrong place — so it lives here, with the tests.
//
// Coordinates are GRID INDEX space: x runs 0…cols-1 along a row, y runs 0…rows-1 down the column,
// fractional where a crossing falls between samples. The renderer maps that to pixels using the
// key vectors, so this file knows nothing about axes, units or page geometry.

/** A straight piece of one contour, in grid index space. */
export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * The interior level boundaries of an evenly divided range.
 *
 * `bands` equal steps from `min` to `max` have `bands - 1` boundaries between them — those are the
 * lines worth drawing. The two ends are excluded on purpose: a contour exactly at the minimum or
 * maximum touches the field at a point or an edge and draws as noise.
 *
 * Returns [] for a flat field, where every level would coincide and there is nothing to show.
 */
export function contourLevels(min: number, max: number, bands = 20): number[] {
  if (!isFinite(min) || !isFinite(max) || max <= min || bands < 2) return [];
  const step = (max - min) / bands;
  const out: number[] = [];
  for (let k = 1; k < bands; k++) out.push(min + k * step);
  return out;
}

/** Where `level` crosses between two sample values, as a 0…1 fraction. */
function crossing(a: number, b: number, level: number): number {
  const d = b - a;
  // Guarded because a cell with two equal corners straddling the level would divide by zero and
  // place the crossing at NaN — which SVG renders as nothing, silently losing part of a contour.
  return d === 0 ? 0.5 : (level - a) / d;
}

/**
 * Marching squares: the segments where `grid` crosses `level`.
 *
 * Each cell is read as a 4-bit case from which corners are at or above the level. The two
 * ambiguous saddle cases (5 and 10) are resolved by the cell's own average — the standard
 * resolution, and the one that keeps a saddle from connecting the wrong pair of edges and
 * turning two separate contours into one that crosses the field.
 *
 * `grid[r][c]`, so y is the row index and x the column index.
 */
export function marchingSquares(grid: number[][], level: number): Segment[] {
  const out: Segment[] = [];
  const rows = grid.length;
  if (rows < 2 || !grid[0] || grid[0].length < 2) return out;
  const cols = grid[0].length;

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const tl = grid[r][c], tr = grid[r][c + 1];
      const br = grid[r + 1][c + 1], bl = grid[r + 1][c];
      if (![tl, tr, br, bl].every(isFinite)) continue;

      let code = 0;
      if (tl >= level) code |= 8;
      if (tr >= level) code |= 4;
      if (br >= level) code |= 2;
      if (bl >= level) code |= 1;
      if (code === 0 || code === 15) continue; // wholly below or wholly above

      // Crossing points on each edge, in grid coordinates.
      const top = { x: c + crossing(tl, tr, level), y: r };
      const right = { x: c + 1, y: r + crossing(tr, br, level) };
      const bottom = { x: c + crossing(bl, br, level), y: r + 1 };
      const left = { x: c, y: r + crossing(tl, bl, level) };
      const seg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
        out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });

      switch (code) {
        case 1:
        case 14:
          seg(left, bottom);
          break;
        case 2:
        case 13:
          seg(bottom, right);
          break;
        case 3:
        case 12:
          seg(left, right);
          break;
        case 4:
        case 11:
          seg(top, right);
          break;
        case 6:
        case 9:
          seg(top, bottom);
          break;
        case 7:
        case 8:
          seg(left, top);
          break;
        // Saddles: two opposite corners above, two below. Which pairing is correct depends on the
        // surface between the samples, and the cell average is the usual stand-in for it.
        case 5: {
          const avg = (tl + tr + br + bl) / 4;
          if (avg >= level) {
            seg(left, top);
            seg(bottom, right);
          } else {
            seg(left, bottom);
            seg(top, right);
          }
          break;
        }
        case 10: {
          const avg = (tl + tr + br + bl) / 4;
          if (avg >= level) {
            seg(left, bottom);
            seg(top, right);
          } else {
            seg(left, top);
            seg(bottom, right);
          }
          break;
        }
      }
    }
  }
  return out;
}

/** The finite minimum and maximum of a grid, ignoring holes. */
export function gridRange(grid: number[][]): { min: number; max: number } {
  let min = Infinity, max = -Infinity;
  for (const row of grid) {
    for (const v of row) {
      if (!isFinite(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return { min, max };
}
