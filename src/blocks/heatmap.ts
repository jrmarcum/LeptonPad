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
}

const EMPTY: HeatSource = { title: '', corner: '', cols: '', rows: '', values: '' };

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
      };
    }
  } catch {
    if (content.trim()) return { ...EMPTY, values: content };
  }
  return { ...EMPTY };
}

/** Split a table-style corner label into the vertical and horizontal axis names. */
export function axisLabels(corner: string): { y: string; x: string } {
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

/** Render the field into `host` using the scope as of this point in the sheet. */
export function renderHeatInto(
  host: HTMLElement,
  src: HeatSource,
  scope: Scope,
  fnScope: FnScope,
) {
  host.innerHTML = '';
  const fail = (msg: string) => {
    const e = document.createElement('div');
    e.className = 'tbl-error';
    e.textContent = msg;
    host.appendChild(e);
  };

  if (src.title.trim()) {
    const t = document.createElement('div');
    t.className = 'tbl-title';
    t.textContent = src.title;
    host.appendChild(t);
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

  // ── Geometry ─────────────────────────────────────────────────────────────
  const labels = axisLabels(src.corner);
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
  const availH = Math.max(120, hostHeight(host));
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
  const levels = contourLevels(min, max, 20);
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
    const i = Math.min(rowsN - 2, Math.floor(uy)), j = Math.min(colsN - 2, Math.floor(ux));
    const tr = uy - i, tc = ux - j;
    const top = grid[i][j] + tc * (grid[i][j + 1] - grid[i][j]);
    const bot = grid[i + 1][j] + tc * (grid[i + 1][j + 1] - grid[i + 1][j]);
    const v = top + tr * (bot - top);

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

  host.appendChild(svg);

  const legend = document.createElement('div');
  legend.className = 'heat-legend';
  legend.textContent = `${fmtNum(min, 4)} … ${fmtNum(max, 4)}${
    unit ? ' ' + unit : ''
  } · ${levels.length} contours`;
  host.appendChild(legend);
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

  const snap = (v: number, min: number) => Math.max(min, Math.round(v / GRID_SIZE) * GRID_SIZE);

  drag('heat-resize-handle', (dx, _dy, sw) => {
    const w = snap(sw + dx, GRID_SIZE * 8);
    el.style.width = `${w}px`;
    block.w = w;
  });
  drag('heat-bottom-handle', (_dx, dy, _sw, sh) => {
    const hh = snap(sh + dy, GRID_SIZE * 5);
    out.style.height = `${hh}px`;
    block.h = hh;
  });
}

/** Same cycle-avoiding seam as the table block — see `table.ts`. */
export let onHeatChanged: (() => void) | null = null;
export function setOnHeatChanged(fn: () => void) {
  onHeatChanged = fn;
}
