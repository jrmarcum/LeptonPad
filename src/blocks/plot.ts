// ---------------------------------------------------------------------------
// Plot block — SVG curve plotter
// ---------------------------------------------------------------------------

import { evalExpr, type FnScope, type Scope, type UnitMap } from '../expr.ts';
import { type Block, DEFAULT_PLOT, type PlotConfig } from '../types.ts';
import { CANVAS_W, globalFnScope, globalScope, margins } from '../state.ts';
import { isDark } from '../utils/theme.ts';
import { prettifyExpr } from '../utils/markdown.ts';

const PLOT_W = 420, PLOT_H = 240;
const PLOT_ML = 54, PLOT_MR = 12, PLOT_MT = 14, PLOT_MB = 40;

/**
 * Above this many auto-annotations, the labels are suppressed as clutter.
 *
 * Shared by the renderer and the duplicate-entry check, because "already marked"
 * has to mean "actually drawn" — refusing a user's point for colliding with an
 * extremum that was suppressed would be a lie.
 */
const MAX_ANNOT = 14;

// ---------------------------------------------------------------------------
// Pure computation helpers
// ---------------------------------------------------------------------------

// WASM-READY: (f64) -> string
export function fmtTick(v: number): string {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 10000 || (abs < 0.001 && abs > 0)) return v.toExponential(1);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

// WASM-READY: (f64, f64) -> f64
export function niceStep(range: number, targetTicks: number): number {
  if (range === 0) return 1;
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

// Dynamic left margin: wide enough to fully show the widest y-tick label.
// font-size 9 monospace ≈ 5.5 px/char; add 12 px for tick mark + gap.
// WASM-READY: (f64, f64) -> f64
export function computePlotML(yMin: number, yMax: number): number {
  const yRange = (yMax - yMin) || 1;
  const yStep = niceStep(yRange, 5);
  let maxLen = 1;
  for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + yStep * 0.001; yv += yStep) {
    const len = fmtTick(+yv.toPrecision(10)).length;
    if (len > maxLen) maxLen = len;
  }
  return Math.max(PLOT_ML, Math.round(maxLen * 5.5 + 12));
}

// WASM-READY: (f64[]) -> f64
export function interpolatePlot(points: [number, number][], xTarget: number): number {
  if (points.length === 0) return NaN;
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i][0] <= xTarget && points[i + 1][0] >= xTarget) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      if (!isFinite(y0) || !isFinite(y1)) return NaN;
      return y0 + (xTarget - x0) / (x1 - x0) * (y1 - y0);
    }
  }
  return NaN;
}

/**
 * Local dy/dx at `xTarget`, taken from the two samples straddling it.
 *
 * Returns 0 where the slope is undefined — off the ends, across a NaN gap, or on
 * a zero-width segment — so callers get a neutral answer rather than Infinity.
 */
export function localSlope(points: [number, number][], xTarget: number): number {
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (x0 <= xTarget && xTarget <= x1) {
      if (!isFinite(y0) || !isFinite(y1) || x1 === x0) return 0;
      return (y1 - y0) / (x1 - x0);
    }
  }
  return 0;
}

export interface Extremum {
  x: number;
  y: number;
  kind: 'max' | 'min';
}

/**
 * Local maxima and minima of the sampled curve.
 *
 * A sample qualifies when it is at least as extreme as both neighbours and
 * strictly more extreme than both second-neighbours — the strict outer test is
 * what stops a flat run from reporting every one of its samples.
 *
 * Exported so the renderer and the duplicate-entry check share ONE definition.
 * Two copies of this logic would drift, and the symptom would be the popup
 * refusing points that are not drawn (or accepting ones that are).
 */
export function findLocalExtrema(points: [number, number][]): Extremum[] {
  const out: Extremum[] = [];
  for (let i = 2; i < points.length - 2; i++) {
    const [, ya] = points[i - 2];
    const [, yb] = points[i - 1];
    const [xv, yv] = points[i];
    const [, yc] = points[i + 1];
    const [, yd] = points[i + 2];
    if (!isFinite(ya) || !isFinite(yb) || !isFinite(yv) || !isFinite(yc) || !isFinite(yd)) continue;
    if (yv >= yb && yv >= yc && yv > ya && yv > yd) out.push({ x: xv, y: yv, kind: 'max' });
    else if (yv <= yb && yv <= yc && yv < ya && yv < yd) out.push({ x: xv, y: yv, kind: 'min' });
  }
  return out;
}

/**
 * Parses a plot block's stored config, applying defaults and migrations.
 *
 * The ONE place `block.content` is turned into a `PlotConfig`. Everything else
 * calls this, so a migration only has to be written once and cannot be missed by
 * a parse site someone forgot about.
 *
 * Migration: user markers were stored under `markers` before 2026-08-13 and are
 * now `xMarkers`, matching `yMarkers`. Projects saved under the old name are
 * read and carried across; the old key is then dropped so it stops propagating.
 */
export function parsePlotConfig(content: string): PlotConfig {
  let raw: Record<string, unknown> = {};
  try {
    raw = (JSON.parse(content || '{}') ?? {}) as Record<string, unknown>;
  } catch {
    raw = {};
  }

  const cfg = { ...DEFAULT_PLOT, ...raw } as PlotConfig;

  // Test RAW, not the merged object: DEFAULT_PLOT already seeds xMarkers: [],
  // so checking cfg.xMarkers here always finds an array and the migration never
  // fires — which would silently drop the markers on every project saved before
  // the rename. Caught by the round-trip test, not by the type checker.
  if (!Array.isArray(raw.xMarkers) && Array.isArray(raw.markers)) {
    cfg.xMarkers = raw.markers as number[];
  }
  if (!Array.isArray(cfg.xMarkers)) cfg.xMarkers = [];
  if (!Array.isArray(cfg.yMarkers)) cfg.yMarkers = [];
  delete cfg.markers;

  return cfg;
}

// ---------------------------------------------------------------------------
// SVG builder
// ---------------------------------------------------------------------------

export function buildPlotSVG(
  points: [number, number][],
  cfg: PlotConfig,
  yMin: number,
  yMax: number,
  dark: boolean,
  markerData: [number, number][] = [],
  plotW = PLOT_W,
  plotH = PLOT_H,
): string {
  const ml = computePlotML(yMin, yMax);
  const pw = plotW - ml - PLOT_MR;
  const ph = plotH - PLOT_MT - PLOT_MB;
  const bg = dark ? '#18181b' : '#ffffff';
  const fg = dark ? '#e4e4e7' : '#18181b';
  const grid = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const axis = dark ? '#52525b' : '#9ca3af';
  const zero = dark ? '#71717a' : '#d1d5db';
  const curve = dark ? '#38bdf8' : '#2563eb';
  const xRange = (cfg.xMax - cfg.xMin) || 1;
  const yRange = (yMax - yMin) || 1;
  const toSX = (x: number) => ml + ((x - cfg.xMin) / xRange) * pw;
  const toSY = (y: number) => PLOT_MT + ph - ((y - yMin) / yRange) * ph;
  // unique clip-path id per render to avoid cross-block conflicts
  const cpId = `pc${Math.random().toString(36).slice(2, 9)}`;
  // clamp annotation label y so it stays within SVG bounds
  const clampLy = (y: number) => Math.max(PLOT_MT + 8, Math.min(plotH - 6, y));

  /**
   * Label baseline for a node drawn at screen y `sy` holding data value `yv`.
   *
   * The area fill shades between the curve and y = 0, so the label always goes
   * on the FAR side from the axis — above a point at or above zero, below one
   * under it. Keyed on the sign of the value, not on max/min: a local minimum
   * sitting above the axis still has the shading beneath it, and a maximum in a
   * wholly negative curve still has the shading above.
   *
   * The +12 for the below case (against −5 for above) is baseline compensation:
   * SVG text hangs below its y, so a symmetric offset would sit too tight.
   */
  const labelLy = (sy: number, yv: number) => (yv >= 0 ? sy - 5 : sy + 12);

  const LINE_H = 9; // font-size 8 monospace, comfortable leading
  const CHAR_W = 4.9; // ditto, average advance

  /**
   * A node's coordinate label, kept on ONE line wherever it fits.
   *
   * `(1.25, 2.00)` is the normal form. Only when that would run off the canvas
   * does it fold to two lines — `(1.25,` over `2.00)` — which reads as the same
   * ordered pair and needs no `x=`/`y=` prefix. Folding roughly halves the width,
   * so it buys back the room before the side has to change.
   *
   * Preference order, most important first:
   *   1. the slope-derived side, so the label stays clear of the curve;
   *   2. the single-line form, because it is tidier;
   *   3. anything at all, rather than text running off the canvas.
   * So it degrades single→stacked on the preferred side before giving up the
   * side, and flips only when even the folded form will not fit.
   *
   * Used by the user-placed markers only. Extrema and zero crossings keep their
   * single-line label and `clampLy` — auto-annotations at slope ~0 whose
   * placement was already settled.
   */
  function nodeLabel(
    sx: number,
    sy: number,
    xv: number,
    yv: number,
    col: string,
    gap: number,
    preferLeft: boolean,
  ): string {
    const single = [`(${fmtTick(xv)}, ${fmtTick(yv)})`];
    const folded = [`(${fmtTick(xv)},`, `${fmtTick(yv)})`];
    const widthOf = (ls: string[]) => Math.max(...ls.map((l) => l.length)) * CHAR_W;

    // Fits within the CANVAS, not the axis rectangle — labels carry no
    // clip-path, so overhanging into the margin is fine.
    const fits = (onLeft: boolean, ls: string[]) =>
      onLeft ? sx - gap - widthOf(ls) >= 2 : sx + gap + widthOf(ls) <= plotW - 2;

    let onLeft = preferLeft;
    let lines: string[];
    if (fits(onLeft, single)) lines = single;
    else if (fits(onLeft, folded)) lines = folded;
    else if (fits(!onLeft, single)) (onLeft = !onLeft), (lines = single);
    else (onLeft = !onLeft), (lines = folded);

    const lx = onLeft ? sx - gap : sx + gap;
    const anchor = onLeft ? 'end' : 'start';

    // Clamp the BLOCK, not each line: clamping independently would collapse the
    // baselines onto each other against an edge.
    const span = (lines.length - 1) * LINE_H;
    const rawTop = yv >= 0 ? labelLy(sy, yv) - span : labelLy(sy, yv);
    const top = Math.max(PLOT_MT + 8, Math.min(plotH - 6 - span, rawTop));

    return lines
      .map((line, i) =>
        `<text x="${lx.toFixed(1)}" y="${
          (top + i * LINE_H).toFixed(1)
        }" text-anchor="${anchor}" font-size="8" fill="${col}" font-family="monospace">${line}</text>`
      )
      .join('');
  }

  let s =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${plotW}" height="${plotH}" style="display:block;max-width:100%">`;
  s += `<rect width="${plotW}" height="${plotH}" fill="${bg}"/>`;
  s +=
    `<clipPath id="${cpId}"><rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}"/></clipPath>`;

  // X ticks + grid
  const xStep = niceStep(xRange, 5);
  for (let xv = Math.ceil(cfg.xMin / xStep) * xStep; xv <= cfg.xMax + xStep * 0.001; xv += xStep) {
    const sx = toSX(xv).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${
      PLOT_MT + ph
    }" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${sx}" y1="${PLOT_MT + ph}" x2="${sx}" y2="${
      PLOT_MT + ph + 4
    }" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${sx}" y="${
      PLOT_MT + ph + 14
    }" text-anchor="middle" font-size="9" fill="${fg}" font-family="monospace">${
      fmtTick(+xv.toPrecision(10))
    }</text>`;
  }

  // Y ticks + grid
  const yStep = niceStep(yRange, 5);
  for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + yStep * 0.001; yv += yStep) {
    const sy = toSY(yv).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${
      ml + pw
    }" y2="${sy}" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${
      ml - 4
    }" y1="${sy}" x2="${ml}" y2="${sy}" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${
      ml - 6
    }" y="${sy}" dominant-baseline="middle" text-anchor="end" font-size="9" fill="${fg}" font-family="monospace">${
      fmtTick(+yv.toPrecision(10))
    }</text>`;
  }

  // Axis border
  s +=
    `<rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}" fill="none" stroke="${axis}" stroke-width="1"/>`;

  // Zero reference lines (dashed)
  if (cfg.xMin <= 0 && cfg.xMax >= 0) {
    const sx = toSX(0).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${
      PLOT_MT + ph
    }" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const sy = toSY(0).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${
      ml + pw
    }" y2="${sy}" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }

  // Fill area between curve and y=0
  if (cfg.fill && points.length > 1) {
    const sy0 = Math.max(PLOT_MT, Math.min(PLOT_MT + ph, toSY(0)));
    let d = '';
    let penDown = false;
    let lastSx = '';
    for (const [xv, yv] of points) {
      const sx = toSX(xv).toFixed(1);
      if (!isFinite(yv)) {
        if (penDown) {
          d += ` L${lastSx},${sy0.toFixed(1)} Z`;
          penDown = false;
        }
        continue;
      }
      const sy = toSY(yv).toFixed(1);
      if (!penDown) {
        d += ` M${sx},${sy0.toFixed(1)} L${sx},${sy}`;
        penDown = true;
      } else d += ` L${sx},${sy}`;
      lastSx = sx;
    }
    if (penDown) d += ` L${lastSx},${sy0.toFixed(1)} Z`;
    if (d) {
      const fillCol = dark ? 'rgba(56,189,248,0.18)' : 'rgba(37,99,235,0.12)';
      s += `<path d="${d.trim()}" fill="${fillCol}" stroke="none" clip-path="url(#${cpId})"/>`;
    }
  }

  // Curve — gap at NaN (discontinuity)
  if (points.length > 1) {
    let d = '';
    let penDown = false;
    for (const [xv, yv] of points) {
      if (!isFinite(yv)) {
        penDown = false;
        continue;
      }
      d += `${penDown ? 'L' : 'M'}${toSX(xv).toFixed(1)},${toSY(yv).toFixed(1)} `;
      penDown = true;
    }
    if (d) {
      s +=
        `<path d="${d.trim()}" fill="none" stroke="${curve}" stroke-width="2" stroke-linejoin="round" clip-path="url(#${cpId})"/>`;
    }
  }

  // ── Zero crossings ────────────────────────────────────────────────────────
  // A zero crossing is just a curve crossing at y = 0 — same routine the y
  // marker entry uses, so the two can never disagree about where they are.
  const zeroCrossings = findCurveCrossings(points, 0).map(([x]) => x);
  const zeroCol = dark ? '#2dd4bf' : '#0d9488';
  if (zeroCrossings.length <= MAX_ANNOT) {
    for (const xc of zeroCrossings) {
      const sx = toSX(xc);
      if (sx < ml || sx > ml + pw) continue;
      const sy = toSY(0);
      s += `<circle cx="${sx.toFixed(1)}" cy="${
        sy.toFixed(1)
      }" r="3" fill="${zeroCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? 'end' : 'start';
      s += `<text x="${lx.toFixed(1)}" y="${
        clampLy(sy - 5).toFixed(1)
      }" text-anchor="${anchor}" font-size="8" fill="${zeroCol}" font-family="monospace">(${
        fmtTick(xc)
      }, 0)</text>`;
    }
  }

  // ── Local extrema ─────────────────────────────────────────────────────────
  const extrema = findLocalExtrema(points);
  const maxCol = dark ? '#fbbf24' : '#d97706';
  const minCol = dark ? '#f87171' : '#dc2626';
  if (extrema.length <= MAX_ANNOT) {
    for (const { x: xv, y: yv, kind } of extrema) {
      const sx = toSX(xv), sy = toSY(yv);
      if (sx < ml || sx > ml + pw || sy < PLOT_MT || sy > PLOT_MT + ph) continue;
      const col = kind === 'max' ? maxCol : minCol;
      s += `<circle cx="${sx.toFixed(1)}" cy="${
        sy.toFixed(1)
      }" r="3" fill="${col}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? 'end' : 'start';
      s += `<text x="${lx.toFixed(1)}" y="${
        clampLy(labelLy(sy, yv)).toFixed(1)
      }" text-anchor="${anchor}" font-size="8" fill="${col}" font-family="monospace">(${
        fmtTick(xv)
      }, ${fmtTick(yv)})</text>`;
    }
  }

  // Permanent markers (pink diamonds). markerData carries both kinds — nodes
  // placed by an x entry and nodes placed by a y entry — because once resolved
  // they are the same thing: a labelled point on the curve.
  const markerCol = dark ? '#f472b6' : '#db2777';
  for (const [xv, yv] of markerData) {
    if (!isFinite(yv)) continue;
    const sx = toSX(xv), sy = toSY(yv);
    if (sx >= ml && sx <= ml + pw && sy >= PLOT_MT && sy <= PLOT_MT + ph) {
      const d = 5;
      s += `<polygon points="${sx.toFixed(1)},${(sy - d).toFixed(1)} ${(sx + d).toFixed(1)},${
        sy.toFixed(1)
      } ${sx.toFixed(1)},${(sy + d).toFixed(1)} ${(sx - d).toFixed(1)},${
        sy.toFixed(1)
      }" fill="${markerCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      // Horizontal side is chosen so the label sits where the curve ISN'T.
      //
      // labelLy() has already put the text above the node for y >= 0 and below
      // it for y < 0. Given that, a rising curve occupies the space above-right
      // of the node, so the label goes LEFT; a falling curve occupies above-left,
      // so it goes RIGHT. Below the axis the label is under the node and both
      // cases mirror — hence the XOR rather than two separate branches.
      // Preferred side only — nodeLabel() owns the fallbacks from here, folding
      // to two lines before it will give up this side.
      const slope = localSlope(points, xv);
      s += nodeLabel(sx, sy, xv, yv, markerCol, 7, (slope >= 0) !== (yv < 0));
    }
  }

  // Axis labels
  if (cfg.xLabel) {
    s += `<text x="${ml + pw / 2}" y="${
      plotH - 4
    }" text-anchor="middle" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg.xLabel}</text>`;
  }
  if (cfg.yLabel) {
    const cy = PLOT_MT + ph / 2;
    s +=
      `<text x="10" y="${cy}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90,10,${cy})" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg.yLabel}</text>`;
  }
  s += '</svg>';
  return s;
}

// ---------------------------------------------------------------------------
// Data evaluation
// ---------------------------------------------------------------------------

/**
 * Resolve a from/to expression to a Quantity (value + unit).
 * Bare numbers are dimensionless; variable references inherit their unit from scope.
 * This unit is propagated to the sweep variable so that polynomials like
 * (l^3 - 2*l*x^2 + x^3) stay dimensionally consistent when l carries a unit.
 */
function resolveRangeQty(
  expr: string,
  fallback: number,
  scope: Scope,
  fnScope: FnScope,
): { v: number; u: UnitMap } {
  if (!expr) return { v: fallback, u: {} };
  const n = parseFloat(expr);
  if (isFinite(n) && String(n) === expr.trim()) return { v: n, u: {} };
  try {
    return evalExpr(expr, scope, fnScope);
  } catch {
    return { v: isFinite(n) ? n : fallback, u: {} };
  }
}

/**
 * Which config entry produced a drawn node.
 *
 * Needed to delete one: a node's own coordinates are not enough, because the
 * config stores the *request* (`xMarkers` / `yMarkers`), not the resolved point.
 * A single y request can produce several nodes, so removing one node removes the
 * request behind it — and every other node that request drew.
 */
export interface MarkerSource {
  kind: 'x' | 'y';
  value: number;
}

export function evalPlotData(
  block: Block,
): {
  points: [number, number][];
  yMin: number;
  yMax: number;
  markerData: [number, number][];
  /** Parallel to `markerData` — index i says which request drew node i. */
  markerSrc: MarkerSource[];
  xMin: number;
  xMax: number;
  error?: string;
} {
  const cfg = parsePlotConfig(block.content);
  if (!cfg.expr.trim()) {
    return {
      points: [],
      yMin: -1,
      yMax: 1,
      markerData: [],
      markerSrc: [],
      xMin: cfg.xMin,
      xMax: cfg.xMax,
    };
  }

  // Resolve from/to expressions, preserving units so the sweep variable carries the
  // same unit as the range bounds (e.g. x gets {ft:1} when xMax references l [ft]).
  const baseScope: Scope = { ...globalScope };
  const xMinExpr = cfg.xMinExpr ?? String(cfg.xMin);
  const xMaxExpr = cfg.xMaxExpr ?? String(cfg.xMax);
  const xMinQty = resolveRangeQty(xMinExpr, cfg.xMin, baseScope, globalFnScope);
  const xMaxQty = resolveRangeQty(xMaxExpr, cfg.xMax, baseScope, globalFnScope);
  const resolvedXMin = isFinite(xMinQty.v) ? xMinQty.v : 0;
  const resolvedXMax = (isFinite(xMaxQty.v) && xMaxQty.v > resolvedXMin)
    ? xMaxQty.v
    : resolvedXMin + 1;
  // Prefer the unit from whichever bound is non-trivial (xMax usually references a variable)
  const xUnit: UnitMap = Object.keys(xMaxQty.u).length > 0
    ? xMaxQty.u
    : Object.keys(xMinQty.u).length > 0
    ? xMinQty.u
    : {};

  const points: [number, number][] = [];
  let yMin = Infinity, yMax = -Infinity;
  let error: string | undefined;

  for (let i = 0; i <= cfg.nPts; i++) {
    const xv = resolvedXMin + (resolvedXMax - resolvedXMin) * (i / cfg.nPts);
    const scope: Scope = { ...globalScope, [cfg.xVar]: { v: xv, u: xUnit } };
    try {
      const yv = evalExpr(cfg.expr, scope, globalFnScope).v;
      points.push([xv, isFinite(yv) ? yv : NaN]);
      if (isFinite(yv)) {
        if (yv < yMin) yMin = yv;
        if (yv > yMax) yMax = yv;
      }
    } catch (e) {
      error = (e as Error).message;
      break;
    }
  }

  if (!isFinite(yMin)) {
    yMin = -1;
    yMax = 1;
  } else if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  } else {
    const pad = (yMax - yMin) * 0.05;
    yMin -= pad;
    yMax += pad;
  }

  // x markers — evaluate the curve at each requested x.
  const markerData: [number, number][] = [];
  const markerSrc: MarkerSource[] = [];

  for (const xv of cfg.xMarkers) {
    const scope: Scope = { ...globalScope, [cfg.xVar]: { v: xv, u: xUnit } };
    let yv: number;
    try {
      yv = evalExpr(cfg.expr, scope, globalFnScope).v;
    } catch {
      yv = NaN;
    }
    markerData.push([xv, yv]);
    markerSrc.push({ kind: 'x', value: xv });
  }

  // y markers — the mirror: find where the curve REACHES each requested y and
  // put a node there. One y can yield several nodes on an oscillating curve,
  // which all trace back to the same request.
  for (const yv of cfg.yMarkers) {
    for (const pt of findCurveCrossings(points, yv)) {
      markerData.push(pt);
      markerSrc.push({ kind: 'y', value: yv });
    }
  }

  return {
    points,
    yMin,
    yMax,
    markerData,
    markerSrc,
    xMin: resolvedXMin,
    xMax: resolvedXMax,
    error,
  };
}

/**
 * Every x where the sampled curve reaches `target`, as `[x, target]` pairs.
 *
 * Walks adjacent samples looking for a sign change in `y - target` and linearly
 * interpolates within the straddling segment — the same resolution the plotted
 * polyline itself has, so a node always lands visually on the drawn curve.
 * Returns empty when the curve never reaches the value, which is what the
 * out-of-bounds warning keys off.
 */
export function findCurveCrossings(
  points: [number, number][],
  target: number,
): [number, number][] {
  const out: [number, number][] = [];
  if (!isFinite(target)) return out;

  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (!isFinite(y0) || !isFinite(y1)) continue;

    const d0 = y0 - target;
    const d1 = y1 - target;

    // Exact hit on the segment start. Handled here rather than via d0*d1 <= 0 so
    // a sample sitting exactly on the target is not emitted twice — once as this
    // segment's end and again as the next segment's start.
    if (d0 === 0) {
      out.push([x0, target]);
      continue;
    }
    if (d0 * d1 < 0) {
      const t = d0 / (d0 - d1);
      out.push([x0 + t * (x1 - x0), target]);
    }
  }

  // The loop only ever inspects segment starts, so the final sample needs its
  // own exact-hit check.
  const last = points[points.length - 1];
  if (last && isFinite(last[1]) && last[1] === target) out.push([last[0], target]);

  return out;
}

// ---------------------------------------------------------------------------
// Marker context popup
// ---------------------------------------------------------------------------

/**
 * Right-click menu for a node the user placed: remove just this one.
 *
 * Shown INSTEAD of the add-a-point popup when the click lands on a node, because
 * offering "add" on top of an existing point is not what the gesture means there.
 *
 * Every node is its own entry in `xMarkers` — including ones found by a y entry,
 * which resolves to individual x markers at add time — so this removes exactly
 * the node clicked and never a sibling.
 */
function showPlotMarkerDelete(
  src: MarkerSource,
  cfg: PlotConfig,
  onMarkerChange: () => void,
  clientX: number,
  clientY: number,
) {
  document.querySelector('.plot-ctx-popup')?.remove();
  const popup = document.createElement('div');
  popup.className = 'plot-ctx-popup';
  popup.style.left = `${clientX}px`;
  popup.style.top = `${clientY}px`;

  const row = document.createElement('div');
  row.className = 'plot-ctx-row';

  const btn = document.createElement('button');
  btn.className = 'plot-ctx-btn plot-ctx-btn-primary';
  btn.textContent = 'Clear current point';
  btn.onclick = () => {
    const list = src.kind === 'x' ? cfg.xMarkers : cfg.yMarkers;
    const i = list.indexOf(src.value);
    if (i !== -1) list.splice(i, 1);
    onMarkerChange();
    popup.remove();
  };
  row.appendChild(btn);
  popup.appendChild(row);

  document.body.appendChild(popup);

  const closeOutside = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('mousedown', closeOutside);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeOutside), 0);
}

function showPlotMarkerInput(
  xDefault: number,
  yDefault: number,
  cfg: PlotConfig,
  points: [number, number][],
  yMin: number,
  yMax: number,
  onMarkerChange: () => void,
  clientX: number,
  clientY: number,
) {
  document.querySelector('.plot-ctx-popup')?.remove();
  const popup = document.createElement('div');
  popup.className = 'plot-ctx-popup';
  popup.style.left = `${clientX}px`;
  popup.style.top = `${clientY}px`;

  // Shared message line. A rejected value leaves the popup open with the input
  // intact so the number can be corrected rather than retyped.
  const msgEl = document.createElement('div');
  msgEl.className = 'plot-ctx-msg';
  msgEl.style.display = 'none';

  /**
   * One labelled input row. `validate` returns an error string to refuse the
   * value, or null to accept it.
   */
  const mkRow = (
    labelText: string,
    initial: number,
    validate: (v: number) => string | null,
    onAdd: (v: number) => void,
  ) => {
    const row = document.createElement('div');
    row.className = 'plot-ctx-row';

    const label = document.createElement('span');
    label.className = 'plot-ctx-label';
    label.textContent = labelText;

    const inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'plot-ctx-input';
    inp.value = isFinite(initial) ? fmtTick(+initial.toPrecision(6)) : '';
    inp.step = 'any';

    const addBtn = document.createElement('button');
    addBtn.className = 'plot-ctx-btn plot-ctx-btn-primary';
    addBtn.textContent = 'Add';

    const commit = () => {
      const v = parseFloat(inp.value);
      if (!isFinite(v)) {
        msgEl.textContent = 'Enter a number.';
        msgEl.style.display = '';
        inp.focus();
        return;
      }

      const err = validate(v);
      if (err) {
        msgEl.textContent = err;
        msgEl.style.display = '';
        inp.focus();
        inp.select();
        return;
      }

      onAdd(v);
      onMarkerChange();
      popup.remove();
    };
    addBtn.onclick = commit;

    inp.addEventListener('input', () => {
      msgEl.style.display = 'none';
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
      if (e.key === 'Escape') popup.remove();
    });

    row.appendChild(label);
    row.appendChild(inp);
    row.appendChild(addBtn);
    popup.appendChild(row);
    return inp;
  };

  // Auto-drawn annotations the user should not be able to duplicate. Only count
  // them when they are actually rendered — past MAX_ANNOT the labels are
  // suppressed, and refusing a point for colliding with something invisible
  // would be indefensible.
  const extrema = findLocalExtrema(points);
  const zeros = findCurveCrossings(points, 0).map(([x]) => x);
  const extremaShown = extrema.length <= MAX_ANNOT;
  const zerosShown = zeros.length <= MAX_ANNOT;

  // One sample spacing. An auto-annotation sits at an arbitrary float the user
  // could never retype exactly, so proximity is the only workable test — and
  // two points closer than one sample render on top of each other anyway.
  const xTol = Math.abs(cfg.xMax - cfg.xMin) / Math.max(cfg.nPts, 1);
  const yTol = Math.abs(yMax - yMin) / Math.max(cfg.nPts, 1);
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

  // x — a node on the curve at this x. Out of bounds when the x sits outside the
  // plotted range, since there is no curve there to put a node on.
  const inp = mkRow(
    'x =',
    xDefault,
    (xv) => {
      if (xv < cfg.xMin || xv > cfg.xMax) {
        return `Point is out of bounds — x range is ${fmtTick(cfg.xMin)} to ${fmtTick(cfg.xMax)}.`;
      }
      if (cfg.xMarkers.some((m) => near(m, xv, xTol))) {
        return `A point at x = ${fmtTick(xv)} already exists.`;
      }
      if (extremaShown) {
        const hit = extrema.find((e) => near(e.x, xv, xTol));
        if (hit) {
          return `A local ${hit.kind === 'max' ? 'maximum' : 'minimum'} is already marked at x = ${
            fmtTick(hit.x)
          }.`;
        }
      }
      if (zerosShown && zeros.some((zx) => near(zx, xv, xTol))) {
        return `A zero crossing is already marked at x = ${fmtTick(xv)}.`;
      }
      return null;
    },
    (xv) => {
      cfg.xMarkers.push(xv);
    },
  );

  // y — a node on the curve wherever it reaches this y. Out of bounds when the
  // curve never gets there, which is what an empty crossing list means.
  mkRow(
    'y =',
    yDefault,
    (yv) => {
      const hits = findCurveCrossings(points, yv);
      if (hits.length === 0) {
        return 'Point is out of bounds — the curve never reaches that y.';
      }
      // Every crossing already marked means there is nothing left to add.
      if (hits.every(([hx]) => cfg.xMarkers.some((m) => near(m, hx, xTol)))) {
        return hits.length === 1
          ? `A point at y = ${fmtTick(yv)} already exists.`
          : `All ${hits.length} points at y = ${fmtTick(yv)} already exist.`;
      }
      if (extremaShown) {
        const hit = extrema.find((e) => near(e.y, yv, yTol));
        if (hit) {
          return `A local ${hit.kind === 'max' ? 'maximum' : 'minimum'} is already marked at y = ${
            fmtTick(hit.y)
          }.`;
        }
      }
      if (zerosShown && zeros.length > 0 && near(0, yv, yTol)) {
        return 'The zero crossings are already marked.';
      }
      return null;
    },
    (yv) => {
      // Resolve to individual x markers rather than storing the y request.
      //
      // A y entry is a way of FINDING points, not a point itself. Once found,
      // each crossing is just a node on the curve — which is exactly what an x
      // marker is — so storing them separately gives every node its own identity
      // and lets one be deleted without touching its siblings.
      //
      // Trade-off, deliberate: a node placed this way stays at its x and follows
      // the curve vertically (y = f(x) re-evaluates). It does not re-hunt for the
      // original y value if the expression changes.
      for (const [hx] of findCurveCrossings(points, yv)) {
        if (!cfg.xMarkers.some((m) => near(m, hx, xTol))) cfg.xMarkers.push(hx);
      }
    },
  );

  popup.appendChild(msgEl);

  const clearRow = document.createElement('div');
  clearRow.className = 'plot-ctx-row';
  const clearBtn = document.createElement('button');
  clearBtn.className = 'plot-ctx-btn';
  clearBtn.textContent = 'Clear All';
  clearBtn.onclick = () => {
    // Only the user-placed markers. Zero crossings and local maxima/minima are
    // derived from the sampled points every render, so they are untouched.
    cfg.xMarkers = [];
    cfg.yMarkers = [];
    onMarkerChange();
    popup.remove();
  };
  clearRow.appendChild(clearBtn);
  popup.appendChild(clearRow);

  document.body.appendChild(popup);
  inp.focus();
  inp.select();

  const closeOutside = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('mousedown', closeOutside);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeOutside), 0);
}

// ---------------------------------------------------------------------------
// Hover interaction
// ---------------------------------------------------------------------------

function attachPlotHover(
  svgWrap: HTMLElement,
  points: [number, number][],
  cfg: PlotConfig,
  yMin: number,
  yMax: number,
  markerData: [number, number][],
  markerSrc: MarkerSource[],
  onMarkerChange: () => void,
  plotW: number,
  plotH: number,
) {
  const svgEl = svgWrap.querySelector('svg');
  if (!svgEl) return;

  const ml = computePlotML(yMin, yMax);
  const pw = plotW - ml - PLOT_MR;
  const ph = plotH - PLOT_MT - PLOT_MB;
  const xRange = (cfg.xMax - cfg.xMin) || 1;
  const yRange = (yMax - yMin) || 1;
  const toSX = (x: number) => ml + ((x - cfg.xMin) / xRange) * pw;
  const toSY = (y: number) => PLOT_MT + ph - ((y - yMin) / yRange) * ph;
  const toDataX = (sx: number) => cfg.xMin + ((sx - ml) / pw) * xRange;
  const toDataY = (sy: number) => yMin + ((PLOT_MT + ph - sy) / ph) * yRange;

  const dark = isDark();
  const hoverColor = dark ? '#34d399' : '#059669';
  const hoverBg = dark ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.88)';
  const hoverFg = dark ? '#e4e4e7' : '#18181b';

  const ns = 'http://www.w3.org/2000/svg';
  const hg = document.createElementNS(ns, 'g');
  hg.style.display = 'none';
  hg.style.pointerEvents = 'none';

  const hLine = document.createElementNS(ns, 'line');
  hLine.setAttribute('stroke', hoverColor);
  hLine.setAttribute('stroke-width', '1');
  hLine.setAttribute('stroke-dasharray', '3,2');
  hLine.setAttribute('y1', String(PLOT_MT));
  hLine.setAttribute('y2', String(PLOT_MT + ph));

  const hDot = document.createElementNS(ns, 'circle');
  hDot.setAttribute('r', '4');
  hDot.setAttribute('fill', hoverColor);

  const hBg = document.createElementNS(ns, 'rect');
  hBg.setAttribute('rx', '3');
  hBg.setAttribute('fill', hoverBg);

  const hTxt = document.createElementNS(ns, 'text');
  hTxt.setAttribute('font-size', '9');
  hTxt.setAttribute('fill', hoverFg);
  hTxt.setAttribute('font-family', 'monospace');

  hg.appendChild(hLine);
  hg.appendChild(hDot);
  hg.appendChild(hBg);
  hg.appendChild(hTxt);
  svgEl.appendChild(hg);

  function getSVGX(e: MouseEvent): number {
    const rect = svgEl!.getBoundingClientRect();
    return (e.clientX - rect.left) * (plotW / rect.width);
  }

  function getSVGY(e: MouseEvent): number {
    const rect = svgEl!.getBoundingClientRect();
    return (e.clientY - rect.top) * (plotH / rect.height);
  }

  /** Radius, in SVG units, within which a click counts as "on" a node. */
  const HIT_R = 8;

  /**
   * Index of the user node under the pointer, or -1.
   *
   * Iterates backwards so the most recently added node wins when two overlap —
   * the one the user is most likely reaching for.
   */
  function markerAt(sx: number, sy: number): number {
    for (let i = markerData.length - 1; i >= 0; i--) {
      const [xv, yv] = markerData[i];
      if (!isFinite(yv)) continue;
      const dx = toSX(xv) - sx;
      const dy = toSY(yv) - sy;
      if (dx * dx + dy * dy <= HIT_R * HIT_R) return i;
    }
    return -1;
  }

  svgEl.addEventListener('mousemove', (e: Event) => {
    const me = e as MouseEvent;
    const sx = getSVGX(me);

    // Cursor feedback over a user node, so the right-click target is findable
    // rather than something you have to already know about.
    const overNode = markerAt(sx, getSVGY(me)) !== -1;
    svgEl.style.cursor = overNode ? 'pointer' : '';
    svgEl.setAttribute(
      'title',
      overNode ? 'Right-click to clear this point' : '',
    );

    if (sx < ml || sx > ml + pw) {
      hg.style.display = 'none';
      return;
    }
    const xv = toDataX(sx);
    const yv = interpolatePlot(points, xv);
    if (!isFinite(yv)) {
      hg.style.display = 'none';
      return;
    }
    const sy = toSY(yv);
    hg.style.display = '';
    hLine.setAttribute('x1', sx.toFixed(1));
    hLine.setAttribute('x2', sx.toFixed(1));
    hDot.setAttribute('cx', sx.toFixed(1));
    hDot.setAttribute('cy', sy.toFixed(1));
    const label = `(${fmtTick(+xv.toPrecision(5))}, ${fmtTick(+yv.toPrecision(5))})`;
    hTxt.textContent = label;
    const txtW = label.length * 5.5 + 8;
    const txtH = 14;
    let tx = sx + 8;
    if (tx + txtW > ml + pw) tx = sx - txtW - 8;
    const ty = sy < PLOT_MT + ph * 0.25 ? sy + 16 : sy - 6;
    hBg.setAttribute('x', String(tx - 2));
    hBg.setAttribute('y', String(ty - 11));
    hBg.setAttribute('width', String(txtW));
    hBg.setAttribute('height', String(txtH));
    hTxt.setAttribute('x', String(tx));
    hTxt.setAttribute('y', String(ty));
  });

  svgEl.addEventListener('mouseleave', () => {
    hg.style.display = 'none';
  });

  svgEl.addEventListener('contextmenu', (e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();
    const sx = getSVGX(me);
    const sy = getSVGY(me);

    // On an existing node the gesture means "do something to THIS point", so
    // offer only that. Adding another point on top of one is never the intent.
    const hit = markerAt(sx, sy);
    if (hit !== -1) {
      showPlotMarkerDelete(markerSrc[hit], cfg, onMarkerChange, me.clientX, me.clientY);
      return;
    }

    showPlotMarkerInput(
      toDataX(sx),
      toDataY(sy),
      cfg,
      points,
      yMin,
      yMax,
      onMarkerChange,
      me.clientX,
      me.clientY,
    );
  });

  // Prevent block drag when clicking inside the SVG
  svgEl.addEventListener('mousedown', (e: Event) => e.stopPropagation());
}

// ---------------------------------------------------------------------------
// buildPlotBlock
// ---------------------------------------------------------------------------

export function buildPlotBlock(el: HTMLElement, block: Block) {
  el.classList.add('plot-block');

  /**
   * `block.content` is the SINGLE SOURCE OF TRUTH for this block's config.
   *
   * Always read through here immediately before writing back. Holding a parsed
   * copy across user interactions is what caused the 2026-08-13 bug where
   * adjusting the range resurrected cleared markers: the settings handler
   * serialised a snapshot taken when the block was built, silently discarding
   * every marker change made since.
   */
  const readCfg = (): PlotConfig => parsePlotConfig(block.content);

  // Seeds the control values below. Read-only — never serialise this back.
  const initialCfg = readCfg();
  if (!block.content) block.content = JSON.stringify(initialCfg);

  // ── Controls ──────────────────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'plot-controls';

  // Row 1: y = <expression>
  const exprRow = document.createElement('div');
  exprRow.className = 'plot-row';
  const exprLabel = document.createElement('span');
  exprLabel.className = 'plot-label';
  exprLabel.textContent = 'y =';
  const exprCell = document.createElement('div');
  exprCell.contentEditable = 'true';
  exprCell.className = 'plot-input plot-expr plot-cell';
  exprCell.dataset.placeholder = 'e.g. sin(x),  x^2 + b,  m*x + c';
  exprCell.dataset.raw = initialCfg.expr;
  exprRow.appendChild(exprLabel);
  exprRow.appendChild(exprCell);
  controls.appendChild(exprRow);

  // Row 2: x-var + range
  const rangeRow = document.createElement('div');
  rangeRow.className = 'plot-row';

  const mkLabel = (text: string) => {
    const s = document.createElement('span');
    s.className = 'plot-label';
    s.textContent = text;
    return s;
  };

  const mkRangeCell = (raw: string, placeholder: string, title: string) => {
    const cell = document.createElement('div');
    cell.contentEditable = 'true';
    cell.className = 'plot-input plot-range plot-cell';
    cell.dataset.placeholder = placeholder;
    cell.dataset.raw = raw;
    cell.title = title;
    return cell;
  };

  const xVarCell = document.createElement('div');
  xVarCell.contentEditable = 'true';
  xVarCell.className = 'plot-input plot-xvar plot-cell';
  xVarCell.dataset.placeholder = 'x';
  xVarCell.dataset.raw = initialCfg.xVar;
  xVarCell.title = 'Sweep variable name';

  const xMinExprInit = initialCfg.xMinExpr ?? String(initialCfg.xMin);
  const xMaxExprInit = initialCfg.xMaxExpr ?? String(initialCfg.xMax);
  const xMinCell = mkRangeCell(xMinExprInit, '0', 'Lower bound — number or variable name');
  const xMaxCell = mkRangeCell(xMaxExprInit, '1', 'Upper bound — number or variable name');

  // Fill checkbox
  const fillLabel = document.createElement('label');
  fillLabel.className = 'plot-fill-label';
  const fillCheck = document.createElement('input');
  fillCheck.type = 'checkbox';
  fillCheck.className = 'plot-fill-check';
  fillCheck.checked = initialCfg.fill ?? true;
  fillLabel.appendChild(fillCheck);
  fillLabel.append(' Fill');

  rangeRow.appendChild(mkLabel('x:'));
  rangeRow.appendChild(xVarCell);
  rangeRow.appendChild(mkLabel('from'));
  rangeRow.appendChild(xMinCell);
  rangeRow.appendChild(mkLabel('to'));
  rangeRow.appendChild(xMaxCell);
  rangeRow.appendChild(fillLabel);
  controls.appendChild(rangeRow);

  el.appendChild(controls);

  // ── SVG output ────────────────────────────────────────────────────────────
  const svgWrap = document.createElement('div');
  svgWrap.className = 'plot-svg-wrap';
  el.appendChild(svgWrap);

  const errEl = document.createElement('div');
  errEl.className = 'plot-err';
  el.appendChild(errEl);

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const plotW = block.w ?? PLOT_W;
    const plotH = block.h ?? PLOT_H;
    const { points, yMin, yMax, markerData, markerSrc, xMin, xMax, error } = evalPlotData(block);
    if (error) {
      errEl.textContent = '⚠ ' + error;
      svgWrap.innerHTML = '';
      return;
    }
    errEl.textContent = '';

    // One-time upgrade of plots saved while y requests were stored whole. Each
    // is resolved to its crossings and folded into xMarkers, so from here every
    // node has its own identity and there is a single code path for deletion.
    // Runs once — yMarkers is empty afterwards, so the re-render cannot loop.
    const legacy = readCfg();
    if (legacy.yMarkers.length > 0) {
      for (const yv of legacy.yMarkers) {
        for (const [hx] of findCurveCrossings(points, yv)) {
          if (!legacy.xMarkers.includes(hx)) legacy.xMarkers.push(hx);
        }
      }
      legacy.yMarkers = [];
      block.content = JSON.stringify(legacy);
      render();
      return;
    }

    const cfgNow = readCfg();
    // Resolved bounds, for axis rendering and the out-of-bounds check only.
    // These are deliberately NOT persisted — xMinExpr/xMaxExpr stay the truth,
    // so a range written as a variable keeps tracking that variable.
    cfgNow.xMin = xMin;
    cfgNow.xMax = xMax;
    svgWrap.innerHTML = buildPlotSVG(
      points,
      cfgNow,
      yMin,
      yMax,
      isDark(),
      markerData,
      plotW,
      plotH,
    );
    attachPlotHover(
      svgWrap,
      points,
      cfgNow,
      yMin,
      yMax,
      markerData,
      markerSrc,
      () => {
        // Persist ONLY the marker lists. cfgNow carries resolved xMin/xMax that
        // must not overwrite the user's range expressions, and re-reading keeps
        // any settings edit made since this render.
        const next = readCfg();
        next.xMarkers = cfgNow.xMarkers;
        next.yMarkers = cfgNow.yMarkers;
        block.content = JSON.stringify(next);
        render();
      },
      plotW,
      plotH,
    );
  }

  function syncAndRender() {
    // Re-read rather than reusing a parsed copy: markers are written to
    // block.content by the marker popup, which this handler knows nothing about.
    // Serialising a stale snapshot here is what resurrected cleared markers.
    const next = readCfg();
    next.expr = exprCell.dataset.raw ?? '';
    next.xVar = xVarCell.dataset.raw?.trim() || 'x';
    next.xMinExpr = xMinCell.dataset.raw?.trim() || '0';
    next.xMaxExpr = xMaxCell.dataset.raw?.trim() || '1';
    next.fill = fillCheck.checked;
    block.content = JSON.stringify(next);
    render();
  }

  function renderExprMath() {
    const html = prettifyExpr(exprCell.dataset.raw ?? '');
    if (html) exprCell.innerHTML = html;
    else exprCell.textContent = exprCell.dataset.raw ?? '';
  }

  function renderXVarMath() {
    const html = prettifyExpr(xVarCell.dataset.raw ?? '');
    if (html) xVarCell.innerHTML = html;
    else xVarCell.textContent = xVarCell.dataset.raw ?? '';
  }

  function bindCell(cell: HTMLDivElement, renderMath: () => void) {
    cell.addEventListener('focus', () => {
      cell.textContent = cell.dataset.raw ?? '';
      const range = document.createRange();
      range.selectNodeContents(cell);
      range.collapse(false);
      globalThis.getSelection()?.removeAllRanges();
      globalThis.getSelection()?.addRange(range);
    });
    cell.addEventListener('input', () => {
      cell.dataset.raw = cell.textContent ?? '';
    });
    cell.addEventListener('blur', () => {
      cell.dataset.raw = cell.textContent?.trim() ?? '';
      syncAndRender();
      renderMath();
    });
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
    });
  }

  function renderRangeCell(cell: HTMLDivElement) {
    const html = prettifyExpr(cell.dataset.raw ?? '');
    if (html) cell.innerHTML = html;
    else cell.textContent = cell.dataset.raw ?? '';
  }

  bindCell(exprCell, renderExprMath);
  bindCell(xVarCell, renderXVarMath);
  bindCell(xMinCell, () => renderRangeCell(xMinCell));
  bindCell(xMaxCell, () => renderRangeCell(xMaxCell));

  fillCheck.addEventListener('change', syncAndRender);

  renderExprMath();
  renderXVarMath();
  renderRangeCell(xMinCell);
  renderRangeCell(xMaxCell);

  // ── Right-edge resize handle ─────────────────────────────────────────────
  const rightHandle = document.createElement('div');
  rightHandle.className = 'plot-right-handle';
  rightHandle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    e.preventDefault();
    rightHandle.setPointerCapture(e.pointerId);
    rightHandle.classList.add('handle-active');
    const startX = e.clientX;
    const startW = block.w ?? PLOT_W;
    const blockLeft = parseInt(el.style.left);
    const maxW = CANVAS_W - margins.right - blockLeft;
    const onMove = (mv: PointerEvent) => {
      const newW = Math.min(Math.max(300, startW + (mv.clientX - startX)), maxW);
      block.w = newW;
      render();
    };
    const onUp = () => {
      rightHandle.removeEventListener('pointermove', onMove);
      rightHandle.removeEventListener('pointerup', onUp);
      rightHandle.classList.remove('handle-active');
      document.body.style.cursor = '';
    };
    rightHandle.addEventListener('pointermove', onMove);
    rightHandle.addEventListener('pointerup', onUp);
    document.body.style.cursor = 'ew-resize';
  });

  // ── Bottom resize handle ──────────────────────────────────────────────────
  const bottomHandle = document.createElement('div');
  bottomHandle.className = 'plot-bottom-handle';
  bottomHandle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    e.preventDefault();
    bottomHandle.setPointerCapture(e.pointerId);
    bottomHandle.classList.add('handle-active');
    const startY = e.clientY;
    const startH = block.h ?? PLOT_H;
    const onMove = (mv: PointerEvent) => {
      const newH = Math.max(120, startH + (mv.clientY - startY));
      block.h = newH;
      render();
    };
    const onUp = () => {
      bottomHandle.removeEventListener('pointermove', onMove);
      bottomHandle.removeEventListener('pointerup', onUp);
      bottomHandle.classList.remove('handle-active');
      document.body.style.cursor = '';
    };
    bottomHandle.addEventListener('pointermove', onMove);
    bottomHandle.addEventListener('pointerup', onUp);
    document.body.style.cursor = 'ns-resize';
  });

  el.appendChild(rightHandle);
  el.appendChild(bottomHandle);

  // Hook for reEvalAllFormulas to refresh after formula changes
  // deno-lint-ignore no-explicit-any
  (el as any).__plotRerender = render;

  render();
}
