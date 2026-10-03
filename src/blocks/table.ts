// ---------------------------------------------------------------------------
// Table block — a matrix rendered with headings
// ---------------------------------------------------------------------------
// A PURE RENDERER. It evaluates expressions and draws the result; it never owns data and there is
// no typing into cells (Jon, 2026-10-02). Values come from a matrix expression — a literal, a
// variable, or `tabulate(…)` — so the same matrix can feed a table, `interp2` and a plot without
// being written twice.
//
// Shape follows a printed engineering table, from the Cdx reference Jon supplied:
//
//     Along Midheight (y = a/2)          ← title, spans the full width
//     b/a  /  x | END | 0.1b / 0.9b | …  ← corner label naming both axes, then column headings
//          4.0  |  0  |    2.60     | …  ← row heading, then the values
//
// Units stay PER CELL rather than being hoisted into a heading: they are already in the matrix,
// and a column is not always unit-consistent.

import { type Block, GRID_SIZE } from '../types.ts';
import { evalExpr, type FnScope, formatUnit, type Quantity, type Scope } from '../expr.ts';
import { fmtNum, SIG_DEFAULT } from './formula.ts';
import { splitTopLevelCommas, transformUnit } from '../utils/markdown.ts';

/** The five source fields, stored as JSON in `block.content`. All are expressions or text. */
export interface TableSource {
  title: string;
  corner: string;
  cols: string;
  rows: string;
  values: string;
}

const EMPTY: TableSource = { title: '', corner: '', cols: '', rows: '', values: '' };

export function parseTableSource(content: string): TableSource {
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
    // Corrupt content is preserved as the values expression rather than discarded — the user can
    // see what was there and recover it, which is what the formula block does with bad JSON too.
    if (content.trim()) return { ...EMPTY, values: content };
  }
  return { ...EMPTY };
}

/** One rendered heading: its display text, kept separate from whatever produced it. */
export type Heading = string;

/**
 * Evaluate a comma-separated heading list.
 *
 * Each part may yield one value OR a vector, and a vector is **spliced** — so the Cdx row
 * headings are simply `ba`, the same vector `interp2` keys on, rather than ten numbers retyped.
 * Retyping them would be a second copy of the data that can silently disagree with the first.
 *
 * Text comes through as itself; a number is formatted the way a result is.
 */
export function evalHeadings(
  src: string,
  scope: Scope,
  fnScope: FnScope,
): { headings: Heading[]; error?: string } {
  const parts = splitTopLevelCommas(src).filter((p) => p !== '');
  const headings: Heading[] = [];
  for (const part of parts) {
    let q: Quantity;
    try {
      q = evalExpr(part, scope, fnScope);
    } catch (e) {
      return { headings, error: `${part}: ${(e as Error).message}` };
    }
    const show = (x: Quantity): string => {
      if (x.s !== undefined) return x.s;
      const u = formatUnit(x.u);
      return fmtNum(x.v, SIG_DEFAULT) + (u ? ` ${u}` : '');
    };
    if (q.m) { for (const x of q.m.flat()) headings.push(show(x)); }
    else headings.push(show(q));
  }
  return { headings };
}

/** Render the block's current source into `host`, using the scope as of this point in the sheet. */
export function renderTableInto(
  host: HTMLElement,
  src: TableSource,
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

  if (!src.values.trim()) {
    fail('No values yet — give this table a matrix, e.g. a variable or tabulate(…)');
    return;
  }

  let vq: Quantity;
  try {
    vq = evalExpr(src.values, scope, fnScope);
  } catch (e) {
    fail(`Values — ${(e as Error).message}`);
    return;
  }
  // A single value is almost certainly a mistyped variable name, and rendering a 1×1 table would
  // hide that rather than report it.
  if (!vq.m) {
    fail(`Values must be a matrix; "${src.values}" is a single value`);
    return;
  }
  const m = vq.m;

  const colsOut = evalHeadings(src.cols, scope, fnScope);
  if (colsOut.error) return fail(`Column headings — ${colsOut.error}`);
  const rowsOut = evalHeadings(src.rows, scope, fnScope);
  if (rowsOut.error) return fail(`Row headings — ${rowsOut.error}`);

  // Headings are optional, but a WRONG COUNT is reported rather than padded or truncated: a table
  // whose labels have quietly slipped by one column is the worst thing this block could produce.
  if (colsOut.headings.length && colsOut.headings.length !== m[0].length) {
    return fail(`${colsOut.headings.length} column headings for ${m[0].length} columns`);
  }
  if (rowsOut.headings.length && rowsOut.headings.length !== m.length) {
    return fail(`${rowsOut.headings.length} row headings for ${m.length} rows`);
  }

  const hasRowHeads = rowsOut.headings.length > 0;
  const table = document.createElement('table');
  table.className = 'tbl-grid';

  if (colsOut.headings.length || src.corner.trim()) {
    const tr = document.createElement('tr');
    if (hasRowHeads || src.corner.trim()) {
      const corner = document.createElement('th');
      corner.className = 'tbl-corner';
      corner.textContent = src.corner;
      tr.appendChild(corner);
    }
    for (const h of colsOut.headings) {
      const th = document.createElement('th');
      th.textContent = h;
      tr.appendChild(th);
    }
    table.appendChild(tr);
  }

  m.forEach((row, i) => {
    const tr = document.createElement('tr');
    if (hasRowHeads) {
      const th = document.createElement('th');
      th.className = 'tbl-rowhead';
      th.textContent = rowsOut.headings[i];
      tr.appendChild(th);
    }
    for (const cell of row) {
      const td = document.createElement('td');
      if (cell.s !== undefined) {
        td.textContent = cell.s;
      } else {
        const u = formatUnit(cell.u);
        td.innerHTML = fmtNum(cell.v, SIG_DEFAULT) +
          (u ? ` <span class="result-unit">${transformUnit(u)}</span>` : '');
        td.title = String(cell.v); // the unrounded value, as a result cell does
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  });

  host.appendChild(table);
}

export function buildTableBlock(el: HTMLElement, block: Block) {
  el.classList.add('table-block');
  if (block.w) el.style.width = `${block.w}px`;
  const src = parseTableSource(block.content);

  // ── Source fields ────────────────────────────────────────────────────────
  // Edited in place and hidden in print, so the sheet shows only the table. An editor that has to
  // be opened would hide the one thing a reviewer wants to check: where the numbers came from.
  const srcWrap = document.createElement('div');
  srcWrap.className = 'tbl-src';

  const field = (key: keyof TableSource, label: string, placeholder: string) => {
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
      onTableChanged?.();
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

  field('title', 'Title', 'spans the table, e.g. Along Midheight (y = a/2)');
  field('corner', 'Corner', 'names both axes, e.g. b/a  /  x');
  field('cols', 'Columns', '"END", "0.1b / 0.9b", …');
  field('rows', 'Rows', 'a vector such as ba, or "A", "B", …');
  field('values', 'Values', 'a matrix: Cdx, or tabulate(x, 0, L, L/10, w(x))');
  el.appendChild(srcWrap);

  const out = document.createElement('div');
  out.className = 'tbl-out';
  el.appendChild(out);

  // Right-edge resize, matching the other resizable blocks.
  const handle = document.createElement('div');
  handle.className = 'table-resize-handle';
  handle.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = el.offsetWidth;
    handle.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const w = Math.max(
        GRID_SIZE * 6,
        Math.round((startW + ev.clientX - startX) / GRID_SIZE) * GRID_SIZE,
      );
      el.style.width = `${w}px`;
      block.w = w;
    };
    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  });
  el.appendChild(handle);
}

/**
 * Called when a source field changes, so the sheet re-evaluates in document order.
 *
 * A slot rather than a direct import: the renderer needs `fmtNum` from `formula.ts`, and
 * `formula.ts` has to call back here during `reEvalAllFormulas`. Importing both ways would close
 * a cycle, which is what `state.ts`'s callback slots exist to avoid.
 */
export let onTableChanged: (() => void) | null = null;
export function setOnTableChanged(fn: () => void) {
  onTableChanged = fn;
}
