// ---------------------------------------------------------------------------
// Heat map block — a matrix drawn as a field, with contours and a hover readout
// ---------------------------------------------------------------------------
// Built for plate deflection: the same matrix a Table shows as numbers, shown as a field. It
// takes the SAME three inputs as the table (values, row keys, column keys), so a sheet defines
// the data once and can present it either way.
//
// The hover readout goes through `interp2` — the very function the calculation uses — so the
// picture and the number agree by construction rather than by coincidence.
//
// Cells are DISCRETE, not smoothed (Jon, 2026-10-02): a 10×6 table has 10×6 of resolution, and a
// smooth fill would imply detail that is not in the data. The contours supply the smoothness.

import { type Block, GRID_SIZE } from '../types.ts';
import { blockMaxBox, onUpdatePageCount } from '../state.ts';
import { evalExpr, type FnScope, formatUnit, type Quantity, type Scope } from '../expr.ts';
import { fmtNum, SIG_DEFAULT } from './formula.ts';
import { contourLevels, gridRange, marchingSquares } from './contours.ts';

/**
 * The same five fields as the table block, in the same order and with the same labels (Jon,
 * 2026-10-02) — so moving between the two needs no re-learning and a table can be copied into a
 * map by copying its fields across.
 *
 * Two read slightly differently here, which is the cost of the shared layout and worth it:
 * `cols`/`rows` are the numeric KEY vectors that scale the axes rather than text headings, and
 * `corner` — which in a table names both axes, as `b/a  /  x` — is split on its last `/` into the
 * vertical and horizontal axis labels.
 */
export interface HeatSource {
  title: string;
  corner: string;
  cols: string;
  rows: string;
  values: string;
  /**
   * Marked points, as an m×2 matrix of (row key, column key) pairs.
   *
   * A FIELD rather than hidden block state (Jon's call, 2026-10-02). A number that appears only
   * on a picture, put there by a click with no visible provenance, is hard to review — whereas
   * `{{b/a, x_f}}` shows at a glance that the mark is *the design location the calculation uses*,
   * and it moves when the inputs move.
   *
   * Coordinates are in KEY units, never pixels — the same discipline the plot's `xMarkers` uses,
   * so a mark survives a resize and a change of axis.
   */
  points: string;
}

const EMPTY: HeatSource = {
  title: '',
  corner: '',
  cols: '',
  rows: '',
  values: '',
  points: '',
};

export function parseHeatSource(content: string): HeatSource {
  try {
    const p = JSON.parse(content || '{}');
    if (p && typeof p === 'object' && !Array.isArray(p)) {
      return {
        title: String(p.title ?? ''),
        corner: String(p.corner ?? ''),
        cols: String(p.cols ?? ''),
        rows: String(p.rows ?? ''),
        values: String(p.values ?? ''),
        points: String(p.points ?? ''),
      };
    }
  } catch {
    if (content.trim()) return { ...EMPTY, values: content };
  }
  return { ...EMPTY };
}

/**
 * Where a key value sits on an axis, as a fractional grid index — the inverse of the tick
 * labelling. Null when it falls outside the table, which a mark reports rather than clamping.
 *
 * Handles either direction, because an axis may run down the page as the Cdx rows do.
 * With no keys the axis IS the index, so the value passes through.
 */
export function indexOfKey(keys: number[] | null, v: number, n: number): number | null {
  if (!keys) return v >= 0 && v <= n - 1 ? v : null;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (v >= Math.min(a, b) && v <= Math.max(a, b)) {
      return b === a ? i : i + (v - a) / (b - a);
    }
  }
  return null;
}

/**
 * Bilinear read at a fractional grid position.
 *
 * Shared by the hover readout and the marked points so the two cannot disagree — a mark and the
 * hover at the same place must show the same number, and two copies of this arithmetic is exactly
 * how they would stop doing so.
 */
export function valueAt(grid: number[][], uy: number, ux: number): number {
  const rows = grid.length, cols = grid[0].length;
  const i = Math.min(rows - 2, Math.max(0, Math.floor(uy)));
  const j = Math.min(cols - 2, Math.max(0, Math.floor(ux)));
  const tr = uy - i, tc = ux - j;
  const top = grid[i][j] + tc * (grid[i][j + 1] - grid[i][j]);
  const bot = grid[i + 1][j] + tc * (grid[i + 1][j + 1] - grid[i + 1][j]);
  return top + tr * (bot - top);
}

/**
 * The key value at a fractional grid index — the inverse of `indexOfKey`.
 *
 * What turns a right-click into something that can go in the Points field: the gesture lands at a
 * pixel, the field holds key units, and this is the step between them.
 */
export function keyAtIndex(keys: number[] | null, u: number): number {
  if (!keys) return u;
  const i = Math.min(keys.length - 2, Math.max(0, Math.floor(u)));
  return keys[i] + (u - i) * (keys[i + 1] - keys[i]);
}

/** Six significant figures, written plainly — never in exponent form, which the parser rejects. */
function keyText(v: number): string {
  return String(+v.toPrecision(6));
}

/**
 * Append a `(row, column)` pair to the text of the Points field.
 *
 * ⚠️ Returns **null when the field is not a plain matrix literal**, rather than overwriting it.
 * The field may hold an expression — `{{b/a, x_f}}` is the case worth having, a mark that moves
 * when the design moves — and rebuilding it from evaluated numbers would silently trade that
 * provenance for a frozen literal. The caller says so instead and leaves the text alone.
 */
export function addPointToSource(points: string, ky: number, kx: number): string | null {
  const pair = `{${keyText(ky)}, ${keyText(kx)}}`;
  const t = points.trim();
  if (!t) return `{${pair}}`;
  if (!t.startsWith('{{') || !t.endsWith('}}')) return null;
  return `${t.slice(0, -1)}, ${pair}}`;
}

/**
 * Split the inside of a `{{…}}` literal into its top-level `{…}` groups, verbatim.
 *
 * Kept as TEXT rather than re-serialised from values, so a group that is an expression survives
 * being a neighbour of one that gets deleted.
 */
function pointGroups(points: string): string[] | null {
  const t = points.trim();
  if (!t.startsWith('{{') || !t.endsWith('}}')) return null;
  const inner = t.slice(1, -1); // the outer braces off, leaving "{…},{…}"
  const out: string[] = [];
  let depth = 0, start = -1;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        out.push(inner.slice(start, i + 1));
        start = -1;
      }
      if (depth < 0) return null;
    }
  }
  return depth === 0 ? out : null;
}

/** How many pairs the Points field lists, or null if it is not a literal. */
export function countPointsInSource(points: string): number | null {
  return pointGroups(points)?.length ?? null;
}

/**
 * Drop the nth `(row, column)` pair from the text of the Points field, 0-based.
 *
 * Null when the field is not a literal or `n` is out of range — same reason as
 * `addPointToSource`. Removing the last pair gives an empty string, not `{{}}`, which would be a
 * matrix with no rows and read as an error.
 */
export function removePointFromSource(points: string, n: number): string | null {
  const groups = pointGroups(points);
  if (!groups || n < 0 || n >= groups.length) return null;
  const kept = groups.filter((_, i) => i !== n);
  return kept.length ? `{${kept.join(', ')}}` : '';
}

/**
 * Split a table-style corner label into the vertical and horizontal axis names.
 *
 * Either half may contain a slash of its own — the Cdx corner is literally `b/a / x/b` — so the
 * separator is the slash written with SPACE around it, which is how it is typed to be read as one.
 * A first-slash rule gives `y = "b"` there and a last-slash rule gives `x = "b"`; both are wrong,
 * in opposite directions. A bare slash with nothing around it is part of a label, not a separator,
 * so it only splits when there is no spaced slash to split on.
 */
export function axisLabels(corner: string): { y: string; x: string } {
  const spaced = corner.match(/^(.*?)\s+\/\s+(.*)$/);
  if (spaced) return { y: spaced[1].trim(), x: spaced[2].trim() };
  const i = corner.lastIndexOf('/');
  if (i < 0) return { y: '', x: corner.trim() };
  return { y: corner.slice(0, i).trim(), x: corner.slice(i + 1).trim() };
}

/**
 * Colour for a value, on a diverging scale **anchored at zero**.
 *
 * The contour LEVELS run uniformly from min to max (Jon's call), but the colour is centred on
 * zero regardless, so the sign of a deflection stays readable at a glance. For all-positive data
 * that simply means one hue is used — which is the correct reading, not a wasted palette.
 *
 * Returned as an explicit `rgb()` so it survives into print as a real colour rather than a
 * theme variable the print stylesheet might drop.
 */
export function heatColor(v: number, scale: number): string {
  if (!isFinite(v) || scale <= 0) return 'rgb(245,245,245)';
  const t = Math.max(-1, Math.min(1, v / scale));
  // Blue for negative, red for positive, near-white at zero — the usual convention for a signed
  // field, and distinguishable in greyscale by lightness alone.
  const mag = Math.abs(t);
  const lo = Math.round(255 - 150 * mag);
  return t >= 0 ? `rgb(255,${lo},${lo})` : `rgb(${lo},${lo},255)`;
}

/**
 * The height the field should draw at.
 *
 * Read from the inline height the resize handle sets, NOT from `clientHeight`: the container is
 * sized by its content until it has been resized, so measuring it would feed the last drawing's
 * height back in and let the map creep on every re-render.
 */
function hostHeight(host: HTMLElement): number {
  const explicit = parseFloat(host.style.height);
  return Number.isFinite(explicit) && explicit > 0 ? explicit : 240;
}

const NS = 'http://www.w3.org/2000/svg';
const svgEl = <K extends keyof SVGElementTagNameMap>(tag: K) => document.createElementNS(NS, tag);

/** The span of an axis, lowest first, whichever way its keys run. */
function axisSpan(keys: number[] | null, n: number): [number, number] {
  if (!keys) return [0, n - 1];
  const a = keys[0], b = keys[keys.length - 1];
  return a <= b ? [a, b] : [b, a];
}

interface HeatMenuOpts {
  clientX: number;
  clientY: number;
  block: Block;
  yLabel: string;
  xLabel: string;
  /** The keys under the cursor — what the menu opens pre-filled with. */
  ky: number;
  kx: number;
  /** The mark this gesture landed on, 0-based, or null for empty field. */
  hit: number | null;
  locate: (ky: number, kx: number) => boolean;
  ySpan: [number, number];
  xSpan: [number, number];
}

/**
 * The right-click menu for placing and removing marks.
 *
 * Deliberately the plot's popup rather than a new idiom: same gesture, same layout, same
 * validate-and-stay-open behaviour, so a refused value is corrected instead of retyped.
 *
 * 🔑 Everything it does goes through the **text of the Points field** — it never keeps a parallel
 * list. The field stays the single source of truth, which is what makes a placed mark reviewable
 * and lets it be edited by hand afterwards.
 */
function showHeatPointMenu(o: HeatMenuOpts) {
  document.querySelector('.heat-ctx-popup')?.remove();
  const popup = document.createElement('div');
  popup.className = 'heat-ctx-popup';
  popup.style.left = `${o.clientX}px`;
  popup.style.top = `${o.clientY}px`;

  const msg = document.createElement('div');
  msg.className = 'heat-ctx-msg';
  msg.style.display = 'none';
  // A refused value leaves the popup open with the entry intact, so it can be corrected.
  const say = (t: string) => {
    msg.textContent = t;
    msg.style.display = '';
  };

  const src = parseHeatSource(o.block.content);
  const commit = (next: string) => {
    src.points = next;
    o.block.content = JSON.stringify(src);
    // The field and the marks are one piece of state shown two ways, so the strip is updated in
    // the same breath. Leaving it stale would show the author a field that disagrees with the map.
    const inp = document.getElementById(o.block.id)?.querySelector<HTMLElement>(
      '.tbl-src-input[data-field="points"]',
    );
    if (inp) inp.textContent = next;
    popup.remove();
    onHeatChanged?.();
  };

  const row = () => {
    const r = document.createElement('div');
    r.className = 'heat-ctx-row';
    popup.appendChild(r);
    return r;
  };

  if (o.hit !== null) {
    // On an existing mark the gesture means "do something to THIS one", so adding is not offered.
    const del = document.createElement('button');
    del.className = 'heat-ctx-btn heat-ctx-btn-primary';
    del.textContent = `Remove point (${o.hit + 1})`;
    del.onclick = () => {
      const next = removePointFromSource(src.points, o.hit as number);
      if (next === null) {
        say('The Points field is an expression — remove the pair there instead.');
        return;
      }
      commit(next);
    };
    row().appendChild(del);
  } else {
    const mk = (label: string, v: number) => {
      const r = row();
      const l = document.createElement('span');
      l.className = 'heat-ctx-label';
      l.textContent = label;
      const i = document.createElement('input');
      i.type = 'number';
      i.step = 'any';
      i.className = 'heat-ctx-input';
      i.value = String(+v.toPrecision(6));
      i.addEventListener('input', () => {
        msg.style.display = 'none';
      });
      r.append(l, i);
      return i;
    };
    // Row key first, the order the pair is typed in — see the legend note in renderHeatInto.
    const yi = mk(`${o.yLabel || 'row'} =`, o.ky);
    const xi = mk(`${o.xLabel || 'col'} =`, o.kx);

    const add = document.createElement('button');
    add.className = 'heat-ctx-btn heat-ctx-btn-primary';
    add.textContent = 'Add point';
    const doAdd = () => {
      const ky = parseFloat(yi.value), kx = parseFloat(xi.value);
      if (!isFinite(ky) || !isFinite(kx)) {
        say('Enter a number for both axes.');
        return;
      }
      // Refused here rather than added and then reported in the legend: the menu knows the ranges
      // and the entry is still in front of the author, which is the moment to fix it.
      if (!o.locate(ky, kx)) {
        say(
          `Outside the table — ${o.yLabel || 'rows'} run ${fmtNum(o.ySpan[0], 4)} to ${
            fmtNum(o.ySpan[1], 4)
          }, ${o.xLabel || 'columns'} ${fmtNum(o.xSpan[0], 4)} to ${fmtNum(o.xSpan[1], 4)}.`,
        );
        return;
      }
      const next = addPointToSource(src.points, ky, kx);
      if (next === null) {
        say(
          'The Points field is an expression, which a pair added here would overwrite. Add it in the field instead.',
        );
        return;
      }
      commit(next);
    };
    add.onclick = doAdd;
    for (const i of [yi, xi]) {
      i.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doAdd();
        }
        if (e.key === 'Escape') popup.remove();
      });
    }
    row().appendChild(add);
    setTimeout(() => {
      yi.focus();
      yi.select();
    }, 0);
  }

  if (countPointsInSource(src.points)) {
    const clr = document.createElement('button');
    clr.className = 'heat-ctx-btn';
    clr.textContent = 'Clear all points';
    clr.onclick = () => commit('');
    row().appendChild(clr);
  }

  popup.appendChild(msg);
  document.body.appendChild(popup);

  // Detached when the popup goes by ANY route — a button inside it, or being superseded — not
  // only on a click outside. The plot's menu had to fix exactly this leak.
  const closeOutside = (e: MouseEvent) => {
    if (popup.isConnected && popup.contains(e.target as Node)) return;
    popup.remove();
    document.removeEventListener('mousedown', closeOutside);
  };
  setTimeout(() => document.addEventListener('mousedown', closeOutside), 0);
}

/**
 * Render the field into `host` using the scope as of this point in the sheet.
 *
 * `block` is optional and only enables the right-click placement menu: it is what the menu writes
 * the new pair back into. The renderer works without it, which is what keeps it testable.
 */
export function renderHeatInto(
  host: HTMLElement,
  src: HeatSource,
  scope: Scope,
  fnScope: FnScope,
  block?: Block,
) {
  host.innerHTML = '';
  const fail = (msg: string) => {
    const e = document.createElement('div');
    e.className = 'tbl-error';
    e.textContent = msg;
    host.appendChild(e);
  };

  // Kept, because the field is laid out in the height left over after the title and the legends.
  let titleEl: HTMLElement | null = null;
  if (src.title.trim()) {
    const t = document.createElement('div');
    t.className = 'tbl-title';
    t.textContent = src.title;
    host.appendChild(t);
    titleEl = t;
  }
  if (!src.values.trim()) return fail('No values yet — give this map a matrix');

  let vq: Quantity;
  try {
    vq = evalExpr(src.values, scope, fnScope);
  } catch (e) {
    return fail(`Values — ${(e as Error).message}`);
  }
  if (!vq.m) return fail(`Values must be a matrix; "${src.values}" is a single value`);

  const m = vq.m;
  const rowsN = m.length, colsN = m[0].length;
  if (rowsN < 2 || colsN < 2) return fail('A field needs at least a 2×2 matrix');

  const grid = m.map((r) => r.map((q) => q.v));
  const unit = formatUnit(m[0][0].u);
  const { min, max } = gridRange(grid);
  if (!isFinite(min)) return fail('The matrix has no finite values');

  // Axis keys are optional; without them the axes are simply index positions.
  const keyVals = (expr: string, n: number): number[] | null => {
    if (!expr.trim()) return null;
    try {
      const q = evalExpr(expr, scope, fnScope);
      if (!q.m) return null;
      const v = q.m.flat().map((x) => x.v);
      return v.length === n ? v : null;
    } catch {
      return null;
    }
  };
  const rowKeys = keyVals(src.rows, rowsN);
  const colKeys = keyVals(src.cols, colsN);
  const labels = axisLabels(src.corner);
  const levels = contourLevels(min, max, 20);

  // ── Marked points: where they are ────────────────────────────────────────
  // Located BEFORE the geometry and drawn after it, because the legend they produce is part of
  // the chrome the field has to be laid out around. ⚠️ v2.8.6/2.8.7 did all of this after the
  // geometry, so the legend was appended below a field already sized to fill the whole block and
  // `.heat-out`'s `overflow: hidden` ate it (Jon, 2026-10-05).
  //
  // Numbered, so the mark on the field stays short and its location is spelled out below:
  // "(1) 2 in" at the point, "(1) @ b/a = 1.6, x/b = 0.25" underneath (Jon, 2026-10-02). A full
  // coordinate beside every dot would bury the field it is drawn on.
  const noted: string[] = [];
  // Where each mark landed, so a right-click can tell "on this point" from "on empty field" —
  // the same distinction the plot draws before deciding which menu to open.
  const marks: { n: number; ux: number; uy: number; v: number }[] = [];
  if (src.points.trim()) {
    let pq: Quantity | null = null;
    try {
      pq = evalExpr(src.points, scope, fnScope);
    } catch (e) {
      noted.push(`Points — ${(e as Error).message}`);
    }
    const pm = pq?.m;
    if (pq && !pm) noted.push('Points must be a matrix of (row, column) pairs');
    else if (pm && pm[0].length !== 2) {
      noted.push(`Points needs 2 columns — a row and a column key — not ${pm[0].length}`);
    } else if (pm) {
      pm.forEach((pr, n) => {
        const ky = pr[0].v, kx = pr[1].v;
        const uy = indexOfKey(rowKeys, ky, rowsN);
        const ux = indexOfKey(colKeys, kx, colsN);
        const where = `${labels.y || 'y'} = ${fmtNum(ky, 4)}, ${labels.x || 'x'} = ${
          fmtNum(kx, 4)
        }`;
        // Outside the table is SAID, not clamped — a mark silently slid to the nearest edge
        // would read as a value at a place the table does not cover.
        if (uy === null || ux === null) {
          noted.push(`(${n + 1}) @ ${where} — outside the table`);
          return;
        }
        noted.push(`(${n + 1}) @ ${where}`);
        marks.push({ n, ux, uy, v: valueAt(grid, uy, ux) });
      });
    }
  }

  // ── The legends, in the DOM before the field is sized ────────────────────
  const mkLegend = (cls: string, lines: string[]) => {
    const d = document.createElement('div');
    d.className = cls;
    for (const line of lines) {
      const r = document.createElement('div');
      r.textContent = line;
      d.appendChild(r);
    }
    host.appendChild(d);
    return d;
  };
  const pointsEl = noted.length ? mkLegend('heat-points-legend', noted) : null;
  const rangeEl = mkLegend('heat-legend', [
    `${fmtNum(min, 4)} … ${fmtNum(max, 4)}${unit ? ' ' + unit : ''} · ${levels.length} contours`,
  ]);

  // ── Geometry ─────────────────────────────────────────────────────────────
  // The field fills the block MINUS its chrome. Measured off the real elements rather than
  // estimated, because a legend line's height comes from the stylesheet and an estimate here
  // would drift the moment that changed.
  const chromeOf = (el: HTMLElement | null, lines: number) => {
    if (!el) return 0;
    const h = el.offsetHeight;
    // A host that is detached or hidden measures 0. Fall back to a per-line estimate so the field
    // still leaves room, rather than going back to drawing over the legend.
    return h > 0 ? h : lines * 13 + 3;
  };
  const chromeH = chromeOf(titleEl, 1) + chromeOf(pointsEl, noted.length) + chromeOf(rangeEl, 1);
  const PAD_L = 54 + (labels.y ? 12 : 0);
  const PAD_R = 14;
  const PAD_T = 8;
  const PAD_B = 30 + (labels.x ? 14 : 0);

  // The field fills whatever the block has been resized to, in BOTH directions (Jon, 2026-10-02).
  //
  // Done by recomputing the cell size rather than by stretching the SVG: `preserveAspectRatio:
  // none` would scale the axis ticks and contour labels along with the field, and distorted text
  // on a stamped sheet is worse than a map that is slightly the wrong shape. So the drawing is
  // laid out at the size it will be shown at and the type stays upright and uniform.
  const availW = Math.max(160, host.clientWidth || 320);
  // ⚠️ Floored, so a long legend shrinks the field rather than squeezing it to nothing. Past that
  // floor the chrome no longer fits and `.heat-out` clips the tail of the legend — at which point
  // the block wants dragging taller, and the handle to do it with is right there.
  const availH = Math.max(80, hostHeight(host) - chromeH);
  const cellW = Math.max(8, (availW - PAD_L - PAD_R) / (colsN - 1));
  const cellH = Math.max(8, (availH - PAD_T - PAD_B) / (rowsN - 1));
  const W = (colsN - 1) * cellW + PAD_L + PAD_R;
  const H = (rowsN - 1) * cellH + PAD_T + PAD_B;

  const svg = svgEl('svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.setAttribute('class', 'heat-svg');

  // Samples sit at the CORNERS of the field, so a cell spans between four of them. Drawing each
  // sample as a patch centred on itself would put half a cell of invented data outside the grid.
  const gx = (x: number) => PAD_L + x * cellW;
  const gy = (y: number) => PAD_T + y * cellH;
  const scale = Math.max(Math.abs(min), Math.abs(max));

  for (let r = 0; r < rowsN - 1; r++) {
    for (let c = 0; c < colsN - 1; c++) {
      const avg = (grid[r][c] + grid[r][c + 1] + grid[r + 1][c] + grid[r + 1][c + 1]) / 4;
      const rect = svgEl('rect');
      rect.setAttribute('x', String(gx(c)));
      rect.setAttribute('y', String(gy(r)));
      rect.setAttribute('width', String(cellW));
      rect.setAttribute('height', String(cellH));
      rect.setAttribute('fill', heatColor(avg, scale));
      svg.appendChild(rect);
    }
  }

  // ── Contours ─────────────────────────────────────────────────────────────
  // Contours are the PRIMARY representation and their labels carry the values — the colour is
  // secondary and may not survive printing (Jon, 2026-10-02: labelled contours are what matters).
  // So the label is not decoration; without it a printed field has no numbers on it at all.
  // (`levels` is computed up with the legends — the count is part of the legend text.)
  for (const lev of levels) {
    const segs = marchingSquares(grid, lev);
    let longest = -1, best = null as null | { mx: number; my: number };
    for (const s of segs) {
      const x1 = gx(s.x1), y1 = gy(s.y1), x2 = gx(s.x2), y2 = gy(s.y2);
      const line = svgEl('line');
      line.setAttribute('x1', x1.toFixed(2));
      line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2));
      line.setAttribute('y2', y2.toFixed(2));
      line.setAttribute('class', 'heat-contour');
      svg.appendChild(line);
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len > longest) {
        longest = len;
        best = { mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
      }
    }
    // One label per level, on its longest run, and ONLY where the run is long enough to hold the
    // text. That self-regulates: an open part of the field gets its label, a crowded one is left
    // clear rather than overprinted into illegibility. 19 labels forced onto a small map would
    // hide the very contours they describe.
    const text = fmtNum(lev, 3);
    if (best && longest >= text.length * 4.6) {
      const t = svgEl('text');
      t.setAttribute('x', best.mx.toFixed(1));
      t.setAttribute('y', best.my.toFixed(1));
      t.setAttribute('class', 'heat-contour-label');
      t.textContent = text;
      svg.appendChild(t);
    }
  }

  // ── Axes ─────────────────────────────────────────────────────────────────
  const tick = (x: number, y: number, text: string, cls: string) => {
    const t = svgEl('text');
    t.setAttribute('x', x.toFixed(1));
    t.setAttribute('y', y.toFixed(1));
    t.setAttribute('class', cls);
    t.textContent = text;
    svg.appendChild(t);
  };
  for (let c = 0; c < colsN; c++) {
    tick(gx(c), H - PAD_B + 14, fmtNum(colKeys ? colKeys[c] : c, 4), 'heat-tick heat-tick-x');
  }
  for (let r = 0; r < rowsN; r++) {
    tick(PAD_L - 6, gy(r) + 4, fmtNum(rowKeys ? rowKeys[r] : r, 4), 'heat-tick heat-tick-y');
  }
  // The corner label, split the way a table's corner reads: left of the slash names the rows,
  // right of it names the columns.
  if (labels.x) tick(PAD_L + (W - PAD_L - PAD_R) / 2, H - 4, labels.x, 'heat-axis heat-tick-x');
  if (labels.y) {
    const t = svgEl('text');
    const cy = PAD_T + (H - PAD_T - PAD_B) / 2;
    t.setAttribute('x', '10');
    t.setAttribute('y', String(cy));
    t.setAttribute('class', 'heat-axis');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('transform', `rotate(-90 10 ${cy.toFixed(1)})`);
    t.textContent = labels.y;
    svg.appendChild(t);
  }

  // ── Hover readout ────────────────────────────────────────────────────────
  // Bilinear on the same grid the contours came from, so the number under the cursor is the
  // number the contour through that point represents.
  const hov = svgEl('g');
  hov.setAttribute('class', 'heat-hover');
  hov.style.display = 'none';
  const dot = svgEl('circle');
  dot.setAttribute('r', '3');
  const box = svgEl('rect');
  box.setAttribute('class', 'heat-hover-box');
  box.setAttribute('height', '16');
  box.setAttribute('rx', '2');
  const txt = svgEl('text');
  txt.setAttribute('class', 'heat-hover-text');
  hov.append(box, txt, dot);
  svg.appendChild(hov);

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const sx = (e as MouseEvent).clientX - rect.left;
    const sy = (e as MouseEvent).clientY - rect.top;
    // Back into grid index space, in the SVG's own units.
    const ux = ((sx / rect.width) * W - PAD_L) / cellW;
    const uy = ((sy / rect.height) * H - PAD_T) / cellH;
    if (ux < 0 || uy < 0 || ux > colsN - 1 || uy > rowsN - 1) {
      hov.style.display = 'none';
      svg.classList.remove('heat-tracking');
      return;
    }
    const v = valueAt(grid, uy, ux);
    const i = Math.min(rowsN - 2, Math.floor(uy)), j = Math.min(colsN - 2, Math.floor(ux));
    const tr = uy - i, tc = ux - j;
    const kx = colKeys ? colKeys[j] + tc * (colKeys[j + 1] - colKeys[j]) : ux;
    const ky = rowKeys ? rowKeys[i] + tr * (rowKeys[i + 1] - rowKeys[i]) : uy;
    const label = `${fmtNum(v, SIG_DEFAULT)}${unit ? ' ' + unit : ''}  @ ${fmtNum(kx, 4)}, ${
      fmtNum(ky, 4)
    }`;

    hov.style.display = '';
    // The pointer is hidden over the field so the DOT is the cursor — the block inherits
    // `cursor: grab` from `.block`, and a hand sitting on top of the reading obscures the one
    // pixel the reading is about. Toggled with the dot rather than set on the SVG outright, so
    // there is never a moment with neither: step into the margin and the hand comes back.
    svg.classList.add('heat-tracking');
    dot.setAttribute('cx', gx(ux).toFixed(1));
    dot.setAttribute('cy', gy(uy).toFixed(1));
    const w = label.length * 5.4 + 8;
    // Flipped near the right edge so the readout never leaves the block — the same rule the
    // context menu needed.
    const bx = gx(ux) + 8 + w > W ? gx(ux) - 8 - w : gx(ux) + 8;
    box.setAttribute('x', bx.toFixed(1));
    box.setAttribute('y', (gy(uy) - 18).toFixed(1));
    box.setAttribute('width', w.toFixed(1));
    txt.setAttribute('x', (bx + 4).toFixed(1));
    txt.setAttribute('y', (gy(uy) - 6).toFixed(1));
    txt.textContent = label;
  });
  svg.addEventListener('mouseleave', () => {
    hov.style.display = 'none';
    svg.classList.remove('heat-tracking');
  });

  // ── Marked points: drawing them ──────────────────────────────────────────
  // The locating happened before the geometry; this only needs gx/gy.
  for (const { n, ux, uy, v } of marks) {
    const mk = svgEl('circle');
    mk.setAttribute('cx', gx(ux).toFixed(1));
    mk.setAttribute('cy', gy(uy).toFixed(1));
    mk.setAttribute('r', '3.2');
    mk.setAttribute('class', 'heat-point');
    svg.appendChild(mk);

    const lbl = svgEl('text');
    const text = `(${n + 1}) ${fmtNum(v, SIG_DEFAULT)}${unit ? ' ' + unit : ''}`;
    // Flipped to the left near the right edge, as the hover readout already does. The last
    // column is a place marks genuinely land — x/b = 1.0 is the edge of the Cdx table — so a
    // label that only runs rightwards would be clipped exactly where it is most wanted.
    // 4.6px/char approximates the 8px label; it decides which side, not the position.
    const flip = gx(ux) + 6 + text.length * 4.6 > W;
    lbl.setAttribute('x', (gx(ux) + (flip ? -6 : 6)).toFixed(1));
    lbl.setAttribute('y', (gy(uy) - 5).toFixed(1));
    if (flip) lbl.setAttribute('text-anchor', 'end');
    lbl.setAttribute('class', 'heat-point-label');
    lbl.textContent = text;
    svg.appendChild(lbl);
  }

  // ── Placing a point ──────────────────────────────────────────────────────
  // Typing a pair into the Points field is exact, but it is not a way to PLACE one (Jon,
  // 2026-10-05) — the author has to read a coordinate off the map first and the field is the only
  // affordance there is. Right-click is that affordance, and it is the gesture the plot already
  // uses for its markers, so the two blocks are learned once. The menu opens pre-filled with the
  // keys under the cursor: the gesture chooses roughly, the entries make it exact before it lands.
  if (block) {
    svg.addEventListener('contextmenu', (e) => {
      const me = e as MouseEvent;
      const r = svg.getBoundingClientRect();
      const ux = (((me.clientX - r.left) / r.width) * W - PAD_L) / cellW;
      const uy = (((me.clientY - r.top) / r.height) * H - PAD_T) / cellH;
      // In the margins the gesture is not about a point at all, so it is left to the block's own
      // menu rather than intercepted — a right-click on the axis labels should still work.
      if (ux < 0 || uy < 0 || ux > colsN - 1 || uy > rowsN - 1) return;
      me.preventDefault();
      me.stopPropagation();

      // About 7px either way, in index units — the dot's own size. Generous enough to hit without
      // being so wide that a point cannot be added near an existing one.
      const hit = marks.find((mk) =>
        Math.abs(mk.ux - ux) <= 7 / cellW && Math.abs(mk.uy - uy) <= 7 / cellH
      );
      showHeatPointMenu({
        clientX: me.clientX,
        clientY: me.clientY,
        block,
        yLabel: labels.y,
        xLabel: labels.x,
        ky: keyAtIndex(rowKeys, uy),
        kx: keyAtIndex(colKeys, ux),
        hit: hit ? hit.n : null,
        locate: (ky, kx) =>
          indexOfKey(rowKeys, ky, rowsN) !== null && indexOfKey(colKeys, kx, colsN) !== null,
        ySpan: axisSpan(rowKeys, rowsN),
        xSpan: axisSpan(colKeys, colsN),
      });
    });
  }

  // Above the legends, which are already in the DOM — they had to be, to be measured.
  host.insertBefore(svg, pointsEl ?? rangeEl);
}

export function buildHeatMapBlock(el: HTMLElement, block: Block) {
  el.classList.add('heatmap-block');
  if (block.w) el.style.width = `${block.w}px`;
  const src = parseHeatSource(block.content);

  const srcWrap = document.createElement('div');
  srcWrap.className = 'tbl-src';
  const field = (key: keyof HeatSource, label: string, placeholder: string) => {
    const row = document.createElement('div');
    row.className = 'tbl-src-row';
    const lab = document.createElement('span');
    lab.className = 'tbl-src-label';
    lab.textContent = label;
    const inp = document.createElement('div');
    inp.className = 'tbl-src-input';
    inp.contentEditable = 'true';
    inp.dataset.placeholder = placeholder;
    // Named so the right-click menu can put a placed point back into the field it belongs to.
    inp.dataset.field = key;
    inp.textContent = src[key];
    const commit = () => {
      src[key] = inp.textContent ?? '';
      block.content = JSON.stringify(src);
      // An empty block keeps its fields visible: with nothing rendered there is nothing else to
      // look at, and a strip that only appears on selection would leave a blank block and no clue.
      el.classList.toggle('tbl-needs-src', !src.values.trim());
      onHeatChanged?.();
    };
    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inp.blur();
      }
    });
    row.append(lab, inp);
    srcWrap.appendChild(row);
  };
  // The table block's five fields, same order and same labels — see HeatSource.
  field('title', 'Title', 'spans the map, e.g. Along Midheight (y = a/2)');
  field('corner', 'Corner', 'names both axes, e.g. b/a  /  x');
  field('cols', 'Columns', 'vector scaling the horizontal axis, e.g. xb');
  field('rows', 'Rows', 'vector scaling the vertical axis, e.g. ba');
  field('values', 'Values', 'a matrix: Cdx, mirror(Cdx), tabulate(…)');
  field('points', 'Points', 'right-click the map to place, or {{b/a, x_f}}');
  // Same rule at build time, so a block restored from a file opens in the right state.
  el.classList.toggle('tbl-needs-src', !src.values.trim());
  el.appendChild(srcWrap);

  const out = document.createElement('div');
  out.className = 'heat-out';
  // The drawing height is a property of the block, so it survives a save and a reload the way the
  // width does. Without it a resized map would come back at the default on open.
  out.style.height = `${block.h ?? 240}px`;
  el.appendChild(out);

  // Resizing changes the layout, not just the scale, so the field is drawn again rather than
  // stretched — see the note in renderHeatInto about distorted type. A ResizeObserver picks up
  // BOTH handles and anything else that changes the size, so there is one path rather than two.
  let lastKey = '';
  new ResizeObserver(() => {
    const key = `${Math.round(out.clientWidth)}x${Math.round(hostHeight(out))}`;
    if (key === lastKey) return; // the re-render itself must not trigger another
    lastKey = key;
    onHeatChanged?.();
  }).observe(out);

  const drag = (
    cls: string,
    onDelta: (dx: number, dy: number, startW: number, startH: number) => void,
  ) => {
    const h = document.createElement('div');
    h.className = cls;
    h.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY;
      const sw = el.offsetWidth, sh = parseFloat(out.style.height) || out.clientHeight;
      h.setPointerCapture(e.pointerId);
      const onMove = (ev: PointerEvent) => onDelta(ev.clientX - sx, ev.clientY - sy, sw, sh);
      const onUp = () => {
        h.removeEventListener('pointermove', onMove);
        h.removeEventListener('pointerup', onUp);
      };
      h.addEventListener('pointermove', onMove);
      h.addEventListener('pointerup', onUp);
    });
    el.appendChild(h);
  };

  // Capped at the right and bottom margins — neither handle had any upper bound, so a heat map
  // could be dragged off the paper in either direction, and print cuts the canvas at the sheet
  // boundary rather than scaling it down (audit 2026-10-07).
  const snap = (v: number, min: number, max: number) =>
    Math.min(Math.max(min, Math.round(v / GRID_SIZE) * GRID_SIZE), max);

  drag('heat-resize-handle', (dx, _dy, sw) => {
    const w = snap(
      sw + dx,
      GRID_SIZE * 8,
      blockMaxBox(el, block, { minW: GRID_SIZE * 8, grid: true }).w,
    );
    el.style.width = `${w}px`;
    block.w = w;
  });
  drag('heat-bottom-handle', (_dx, dy, _sw, sh) => {
    // `block.h` sizes the field (`out`), not the whole block, so the label and range rows above it
    // have to come out of the budget or the cap is short by exactly that chrome.
    const chromeH = Math.max(0, el.offsetHeight - out.offsetHeight);
    const maxH = blockMaxBox(el, block, { minH: GRID_SIZE * 5, grid: true }).h - chromeH;
    const hh = snap(sh + dy, GRID_SIZE * 5, Math.max(GRID_SIZE * 5, maxH));
    out.style.height = `${hh}px`;
    block.h = hh;
    onUpdatePageCount?.();
  });
}

/** Same cycle-avoiding seam as the table block — see `table.ts`. */
export let onHeatChanged: (() => void) | null = null;
export function setOnHeatChanged(fn: () => void) {
  onHeatChanged = fn;
}
