// ---------------------------------------------------------------------------
// Plot block — SVG curve plotter
// ---------------------------------------------------------------------------

import { evalExpr, type Scope } from '../expr.ts';
import { type Block, type PlotConfig, DEFAULT_PLOT } from '../types.ts';
import { globalScope, globalFnScope } from '../state.ts';
import { isDark } from '../utils/theme.ts';
import { prettifyExpr } from '../utils/markdown.ts';

const PLOT_W = 420, PLOT_H = 240;
const PLOT_ML = 54, PLOT_MR = 12, PLOT_MT = 14, PLOT_MB = 40;

// ---------------------------------------------------------------------------
// Pure computation helpers
// ---------------------------------------------------------------------------

// WASM-READY: (f64) -> string
export function fmtTick(v: number): string {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 10000 || (abs < 0.001 && abs > 0)) return v.toExponential(1);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10)  return v.toFixed(1);
  if (abs >= 1)   return v.toFixed(2);
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
): string {
  const ml = computePlotML(yMin, yMax);
  const pw = PLOT_W - ml - PLOT_MR;
  const ph = PLOT_H - PLOT_MT - PLOT_MB;
  const bg    = dark ? '#18181b' : '#ffffff';
  const fg    = dark ? '#e4e4e7' : '#18181b';
  const grid  = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const axis  = dark ? '#52525b' : '#9ca3af';
  const zero  = dark ? '#71717a' : '#d1d5db';
  const curve = dark ? '#38bdf8' : '#2563eb';
  const xRange = (cfg.xMax - cfg.xMin) || 1;
  const yRange = (yMax - yMin) || 1;
  const toSX = (x: number) => ml + ((x - cfg.xMin) / xRange) * pw;
  const toSY = (y: number) => PLOT_MT + ph - ((y - yMin) / yRange) * ph;
  // unique clip-path id per render to avoid cross-block conflicts
  const cpId = `pc${Math.random().toString(36).slice(2, 9)}`;
  // clamp annotation label y so it stays within SVG bounds
  const clampLy = (y: number) => Math.max(PLOT_MT + 8, Math.min(PLOT_H - 6, y));

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLOT_W}" height="${PLOT_H}" style="display:block;max-width:100%">`;
  s += `<rect width="${PLOT_W}" height="${PLOT_H}" fill="${bg}"/>`;
  s += `<clipPath id="${cpId}"><rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}"/></clipPath>`;

  // X ticks + grid
  const xStep = niceStep(xRange, 5);
  for (let xv = Math.ceil(cfg.xMin / xStep) * xStep; xv <= cfg.xMax + xStep * 0.001; xv += xStep) {
    const sx = toSX(xv).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${PLOT_MT + ph}" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${sx}" y1="${PLOT_MT + ph}" x2="${sx}" y2="${PLOT_MT + ph + 4}" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${sx}" y="${PLOT_MT + ph + 14}" text-anchor="middle" font-size="9" fill="${fg}" font-family="monospace">${fmtTick(+xv.toPrecision(10))}</text>`;
  }

  // Y ticks + grid
  const yStep = niceStep(yRange, 5);
  for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + yStep * 0.001; yv += yStep) {
    const sy = toSY(yv).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${ml + pw}" y2="${sy}" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${ml - 4}" y1="${sy}" x2="${ml}" y2="${sy}" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${ml - 6}" y="${sy}" dominant-baseline="middle" text-anchor="end" font-size="9" fill="${fg}" font-family="monospace">${fmtTick(+yv.toPrecision(10))}</text>`;
  }

  // Axis border
  s += `<rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}" fill="none" stroke="${axis}" stroke-width="1"/>`;

  // Zero reference lines (dashed)
  if (cfg.xMin <= 0 && cfg.xMax >= 0) {
    const sx = toSX(0).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${PLOT_MT + ph}" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const sy = toSY(0).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${ml + pw}" y2="${sy}" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }

  // Curve — gap at NaN (discontinuity)
  if (points.length > 1) {
    let d = '';
    let penDown = false;
    for (const [xv, yv] of points) {
      if (!isFinite(yv)) { penDown = false; continue; }
      d += `${penDown ? 'L' : 'M'}${toSX(xv).toFixed(1)},${toSY(yv).toFixed(1)} `;
      penDown = true;
    }
    if (d) s += `<path d="${d.trim()}" fill="none" stroke="${curve}" stroke-width="2" stroke-linejoin="round" clip-path="url(#${cpId})"/>`;
  }

  // ── Zero crossings ────────────────────────────────────────────────────────
  const MAX_ANNOT = 14; // suppress labels if too many to avoid clutter
  const zeroCrossings: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (!isFinite(y0) || !isFinite(y1)) continue;
    if (y0 === 0) {
      zeroCrossings.push(x0);
    } else if (y0 * y1 < 0) {
      zeroCrossings.push(x0 + (-y0 / (y1 - y0)) * (x1 - x0));
    }
  }
  const zeroCol = dark ? '#2dd4bf' : '#0d9488';
  if (zeroCrossings.length <= MAX_ANNOT) {
    for (const xc of zeroCrossings) {
      const sx = toSX(xc);
      if (sx < ml || sx > ml + pw) continue;
      const sy = toSY(0);
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="${zeroCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? 'end' : 'start';
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(sy - 5).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${zeroCol}" font-family="monospace">(${fmtTick(xc)}, 0)</text>`;
    }
  }

  // ── Local extrema ─────────────────────────────────────────────────────────
  const extrema: Array<{ x: number; y: number; kind: 'max' | 'min' }> = [];
  for (let i = 2; i < points.length - 2; i++) {
    const [, ya] = points[i - 2];
    const [, yb] = points[i - 1];
    const [xv, yv] = points[i];
    const [, yc] = points[i + 1];
    const [, yd] = points[i + 2];
    if (!isFinite(ya) || !isFinite(yb) || !isFinite(yv) || !isFinite(yc) || !isFinite(yd)) continue;
    if (yv >= yb && yv >= yc && yv > ya && yv > yd) {
      extrema.push({ x: xv, y: yv, kind: 'max' });
    } else if (yv <= yb && yv <= yc && yv < ya && yv < yd) {
      extrema.push({ x: xv, y: yv, kind: 'min' });
    }
  }
  const maxCol = dark ? '#fbbf24' : '#d97706';
  const minCol = dark ? '#f87171' : '#dc2626';
  if (extrema.length <= MAX_ANNOT) {
    for (const { x: xv, y: yv, kind } of extrema) {
      const sx = toSX(xv), sy = toSY(yv);
      if (sx < ml || sx > ml + pw || sy < PLOT_MT || sy > PLOT_MT + ph) continue;
      const col = kind === 'max' ? maxCol : minCol;
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="${col}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? 'end' : 'start';
      const rawLy = kind === 'max' ? sy - 5 : sy + 12;
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(rawLy).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${col}" font-family="monospace">(${fmtTick(xv)}, ${fmtTick(yv)})</text>`;
    }
  }

  // Permanent markers (pink diamonds)
  const markerCol = dark ? '#f472b6' : '#db2777';
  for (const [xv, yv] of markerData) {
    if (!isFinite(yv)) continue;
    const sx = toSX(xv), sy = toSY(yv);
    if (sx >= ml && sx <= ml + pw && sy >= PLOT_MT && sy <= PLOT_MT + ph) {
      const d = 5;
      s += `<polygon points="${sx.toFixed(1)},${(sy - d).toFixed(1)} ${(sx + d).toFixed(1)},${sy.toFixed(1)} ${sx.toFixed(1)},${(sy + d).toFixed(1)} ${(sx - d).toFixed(1)},${sy.toFixed(1)}" fill="${markerCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 7 : sx + 7;
      const anchor = sx > ml + pw * 0.75 ? 'end' : 'start';
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(sy + 4).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${markerCol}" font-family="monospace">(${fmtTick(xv)}, ${fmtTick(yv)})</text>`;
    }
  }

  // Axis labels
  if (cfg.xLabel) {
    s += `<text x="${ml + pw / 2}" y="${PLOT_H - 4}" text-anchor="middle" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg.xLabel}</text>`;
  }
  if (cfg.yLabel) {
    const cy = PLOT_MT + ph / 2;
    s += `<text x="10" y="${cy}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90,10,${cy})" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg.yLabel}</text>`;
  }
  s += '</svg>';
  return s;
}

// ---------------------------------------------------------------------------
// Data evaluation
// ---------------------------------------------------------------------------

export function evalPlotData(block: Block): { points: [number, number][]; yMin: number; yMax: number; markerData: [number, number][]; error?: string } {
  let cfg: PlotConfig;
  try { cfg = { ...DEFAULT_PLOT, ...JSON.parse(block.content || '{}') }; }
  catch { cfg = { ...DEFAULT_PLOT }; }
  if (!cfg.expr.trim()) return { points: [], yMin: -1, yMax: 1, markerData: [] };

  const points: [number, number][] = [];
  let yMin = Infinity, yMax = -Infinity;
  let error: string | undefined;

  for (let i = 0; i <= cfg.nPts; i++) {
    const xv = cfg.xMin + (cfg.xMax - cfg.xMin) * (i / cfg.nPts);
    const scope: Scope = { ...globalScope, [cfg.xVar]: { v: xv, u: {} } };
    try {
      const yv = evalExpr(cfg.expr, scope, globalFnScope).v;
      points.push([xv, isFinite(yv) ? yv : NaN]);
      if (isFinite(yv)) { if (yv < yMin) yMin = yv; if (yv > yMax) yMax = yv; }
    } catch (e) {
      error = (e as Error).message;
      break;
    }
  }

  if (!isFinite(yMin)) { yMin = -1; yMax = 1; }
  else if (yMin === yMax) { yMin -= 1; yMax += 1; }
  else { const pad = (yMax - yMin) * 0.05; yMin -= pad; yMax += pad; }

  // Evaluate marker y values
  const markers: number[] = Array.isArray(cfg.markers) ? cfg.markers : [];
  const markerData: [number, number][] = markers.map((xv) => {
    const scope: Scope = { ...globalScope, [cfg.xVar]: { v: xv, u: {} } };
    try { return [xv, evalExpr(cfg.expr, scope, globalFnScope).v] as [number, number]; }
    catch { return [xv, NaN] as [number, number]; }
  });

  return { points, yMin, yMax, markerData, error };
}

// ---------------------------------------------------------------------------
// Marker context popup
// ---------------------------------------------------------------------------

function showPlotMarkerInput(
  xDefault: number,
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

  const label = document.createElement('span');
  label.className = 'plot-ctx-label';
  label.textContent = 'x =';

  const inp = document.createElement('input');
  inp.type = 'number';
  inp.className = 'plot-ctx-input';
  inp.value = fmtTick(+xDefault.toPrecision(6));
  inp.step = 'any';

  const addBtn = document.createElement('button');
  addBtn.className = 'plot-ctx-btn plot-ctx-btn-primary';
  addBtn.textContent = 'Add';
  addBtn.onclick = () => {
    const xv = parseFloat(inp.value);
    if (isFinite(xv)) {
      if (!Array.isArray(cfg.markers)) cfg.markers = [];
      cfg.markers.push(xv);
      onMarkerChange();
    }
    popup.remove();
  };

  const clearBtn = document.createElement('button');
  clearBtn.className = 'plot-ctx-btn';
  clearBtn.textContent = 'Clear All';
  clearBtn.onclick = () => { cfg.markers = []; onMarkerChange(); popup.remove(); };

  row.appendChild(label);
  row.appendChild(inp);
  row.appendChild(addBtn);
  row.appendChild(clearBtn);
  popup.appendChild(row);
  document.body.appendChild(popup);
  inp.focus();
  inp.select();

  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
    if (e.key === 'Escape') popup.remove();
  });
  const closeOutside = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) { popup.remove(); document.removeEventListener('mousedown', closeOutside); }
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
  onMarkerChange: () => void,
) {
  const svgEl = svgWrap.querySelector('svg');
  if (!svgEl) return;

  const ml = computePlotML(yMin, yMax);
  const pw = PLOT_W - ml - PLOT_MR;
  const ph = PLOT_H - PLOT_MT - PLOT_MB;
  const xRange = (cfg.xMax - cfg.xMin) || 1;
  const yRange = (yMax - yMin) || 1;
  const toSY = (y: number) => PLOT_MT + ph - ((y - yMin) / yRange) * ph;
  const toDataX = (sx: number) => cfg.xMin + ((sx - ml) / pw) * xRange;

  const dark = isDark();
  const hoverColor = dark ? '#34d399' : '#059669';
  const hoverBg    = dark ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.88)';
  const hoverFg    = dark ? '#e4e4e7' : '#18181b';

  const ns = 'http://www.w3.org/2000/svg';
  const hg  = document.createElementNS(ns, 'g');
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
    return (e.clientX - rect.left) * (PLOT_W / rect.width);
  }

  svgEl.addEventListener('mousemove', (e: Event) => {
    const me = e as MouseEvent;
    const sx = getSVGX(me);
    if (sx < ml || sx > ml + pw) { hg.style.display = 'none'; return; }
    const xv = toDataX(sx);
    const yv = interpolatePlot(points, xv);
    if (!isFinite(yv)) { hg.style.display = 'none'; return; }
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

  svgEl.addEventListener('mouseleave', () => { hg.style.display = 'none'; });

  svgEl.addEventListener('contextmenu', (e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();
    const sx = getSVGX(me);
    showPlotMarkerInput(toDataX(sx), cfg, onMarkerChange, me.clientX, me.clientY);
  });

  // Prevent block drag when clicking inside the SVG
  svgEl.addEventListener('mousedown', (e: Event) => e.stopPropagation());
}

// ---------------------------------------------------------------------------
// buildPlotBlock
// ---------------------------------------------------------------------------

export function buildPlotBlock(el: HTMLElement, block: Block) {
  el.classList.add('plot-block');

  let cfg: PlotConfig;
  try { cfg = { ...DEFAULT_PLOT, ...JSON.parse(block.content || '{}') }; }
  catch { cfg = { ...DEFAULT_PLOT }; block.content = JSON.stringify(cfg); }

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
  exprCell.dataset.raw = cfg.expr;
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
  const mkNumInput = (val: number, w: string) => {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'plot-input plot-range';
    inp.style.width = w;
    inp.value = String(val);
    inp.step = 'any';
    return inp;
  };

  const xVarCell = document.createElement('div');
  xVarCell.contentEditable = 'true';
  xVarCell.className = 'plot-input plot-xvar plot-cell';
  xVarCell.dataset.placeholder = 'x';
  xVarCell.dataset.raw = cfg.xVar;
  xVarCell.title = 'Sweep variable name';

  const xMinInput = mkNumInput(cfg.xMin, '4.5rem');
  const xMaxInput = mkNumInput(cfg.xMax, '4.5rem');

  rangeRow.appendChild(mkLabel('x:'));
  rangeRow.appendChild(xVarCell);
  rangeRow.appendChild(mkLabel('from'));
  rangeRow.appendChild(xMinInput);
  rangeRow.appendChild(mkLabel('to'));
  rangeRow.appendChild(xMaxInput);
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
    const { points, yMin, yMax, markerData, error } = evalPlotData(block);
    if (error) {
      errEl.textContent = '⚠ ' + error;
      svgWrap.innerHTML = '';
      return;
    }
    errEl.textContent = '';
    let cfgNow: PlotConfig;
    try { cfgNow = { ...DEFAULT_PLOT, ...JSON.parse(block.content || '{}') }; }
    catch { cfgNow = { ...DEFAULT_PLOT }; }
    svgWrap.innerHTML = buildPlotSVG(points, cfgNow, yMin, yMax, isDark(), markerData);
    attachPlotHover(svgWrap, points, cfgNow, yMin, yMax, () => {
      block.content = JSON.stringify(cfgNow);
      render();
    });
  }

  function syncAndRender() {
    cfg.expr  = exprCell.dataset.raw ?? '';
    cfg.xVar  = xVarCell.dataset.raw?.trim() || 'x';
    cfg.xMin  = parseFloat(xMinInput.value);
    cfg.xMax  = parseFloat(xMaxInput.value);
    if (!isFinite(cfg.xMin)) cfg.xMin = 0;
    if (!isFinite(cfg.xMax) || cfg.xMax <= cfg.xMin) cfg.xMax = cfg.xMin + 1;
    block.content = JSON.stringify(cfg);
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
    cell.addEventListener('input', () => { cell.dataset.raw = cell.textContent ?? ''; });
    cell.addEventListener('blur', () => {
      cell.dataset.raw = cell.textContent?.trim() ?? '';
      syncAndRender();
      renderMath();
    });
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).blur(); }
    });
  }

  bindCell(exprCell, renderExprMath);
  bindCell(xVarCell, renderXVarMath);

  for (const inp of [xMinInput, xMaxInput]) {
    inp.addEventListener('blur', syncAndRender);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); });
  }

  renderExprMath();
  renderXVarMath();

  // Hook for reEvalAllFormulas to refresh after formula changes
  // deno-lint-ignore no-explicit-any
  (el as any).__plotRerender = render;

  render();
}
