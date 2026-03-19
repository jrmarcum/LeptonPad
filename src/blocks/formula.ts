// ---------------------------------------------------------------------------
// Formula block — editable rows with live evaluation, control-flow, and units
// ---------------------------------------------------------------------------

import { evalExpr, evalFormulaRows, formatUnit, type Scope, type FnScope, type FormulaRow } from '../expr.ts';
import { type Block } from '../types.ts';
import {
  state, canvas, globalScope, globalFnScope,
  childToSection, sectionSummaryVarNames, sectionSummaryComparisons,
  onSectionSummaryUpdate, onRefreshAllSectionHeights,
} from '../state.ts';
import { transformPiece, prettifyExpr, renderInlineMd } from '../utils/markdown.ts';

/** Regex that detects comparison operators in a raw expression string. */
const COMP_RE = /[<>]=?|[!=]=/;

// ---------------------------------------------------------------------------
// Pure computation helpers
// ---------------------------------------------------------------------------

// WASM-READY: (f64) -> string
export function fmtNum(n: number): string {
  if (!isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e9) return n.toLocaleString();
  return parseFloat(n.toPrecision(6)).toString();
}

// WASM-READY: (string) -> string
export function expandDotNotation(expr: string): string {
  return expr.replace(/\b([A-Za-z_]\w*)\.([A-Za-z_]\w*)\b/g, '$1__$2');
}

// ---------------------------------------------------------------------------
// Formula row parsing
// ---------------------------------------------------------------------------

/** Parse formula block content (JSON new-format or legacy semicolon string). */
export function parseFormulaRows(content: string): FormulaRow[] {
  try {
    const p = JSON.parse(content);
    if (Array.isArray(p) && (p.length === 0 || 'e' in p[0])) {
      return p.map((r: Record<string, unknown>) => {
        const row: FormulaRow = { e: String(r.e ?? ''), d: String(r.d ?? '') };
        if (r.type) row.type = r.type as FormulaRow['type'];
        if (r.ref) row.ref = String(r.ref);
        return row;
      });
    }
  } catch { /* fall through */ }
  return content.split(';').map((s) => ({ e: s.trim(), d: '' }));
}

// ---------------------------------------------------------------------------
// DOM helpers (formula block internals)
// ---------------------------------------------------------------------------

/**
 * Insert a <br> at the current selection inside a contentEditable element.
 * Keeps the DOM in inline (non-div) structure so serializeEditable works reliably.
 */
function insertLineBreak(): void {
  const sel = globalThis.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const br = document.createElement('br');
  range.insertNode(br);
  if (!br.nextSibling || (br.nextSibling.nodeType === Node.TEXT_NODE && br.nextSibling.textContent === '')) {
    const sentinel = document.createElement('br');
    br.after(sentinel);
    range.setStartBefore(sentinel);
  } else {
    range.setStartAfter(br);
  }
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Serialize a contentEditable element to plain text with \n for line breaks.
 */
function serializeEditable(el: HTMLElement): string {
  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const elem = node as HTMLElement;
    if (elem.tagName === 'BR') return '\n';
    if (elem.tagName === 'DIV' || elem.tagName === 'P') {
      const kids = Array.from(elem.childNodes);
      const isEmptyBlock = kids.length === 0 ||
        (kids.length === 1 && (kids[0] as HTMLElement).tagName === 'BR');
      return isEmptyBlock ? '' : kids.map(processNode).join('');
    }
    return Array.from(elem.childNodes).map(processNode).join('');
  }
  const children = Array.from(el.childNodes);
  const hasBlocks = children.some(
    (n) => n instanceof HTMLElement && (n.tagName === 'DIV' || n.tagName === 'P'),
  );
  if (hasBlocks) {
    const lines: string[] = [];
    for (const child of children) {
      if (child instanceof HTMLElement && (child.tagName === 'DIV' || child.tagName === 'P')) {
        lines.push(processNode(child));
      } else {
        if (lines.length === 0) lines.push('');
        lines[lines.length - 1] += processNode(child);
      }
    }
    return lines.join('\n');
  }
  return children.map(processNode).join('');
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

/** Apply evalFormulaRows results to a formula block's DOM result spans. */
export function applyEvalResults(
  formulaEl: HTMLElement,
  // deno-lint-ignore no-explicit-any
  stmts: any[],
) {
  const rowEls = Array.from(formulaEl.querySelectorAll<HTMLElement>('.formula-row'));
  // deno-lint-ignore no-explicit-any
  stmts.forEach((stmt: any, i: number) => {
    const rowEl = rowEls[i];
    if (rowEl) rowEl.classList.toggle('formula-row--inactive', stmt.active === false && !stmt.rowType);

    const r = formulaEl.querySelector<HTMLElement>(`[data-result="${i}"]`);
    if (!r) return;

    if (stmt.rowType === 'if' || stmt.rowType === 'elseif') {
      const taken = (stmt.condValue ?? 0) !== 0 && !stmt.error;
      if (stmt.error) { r.textContent = 'err'; r.title = stmt.error; r.className = 'formula-result formula-error'; }
      else { r.textContent = taken ? '▶ true' : '▷ false'; r.title = ''; r.className = `formula-result ${taken ? 'formula-cond-true' : 'formula-cond-false'}`; }
      return;
    }
    if (stmt.rowType === 'else') {
      const taken = (stmt.condValue ?? 0) !== 0;
      r.textContent = taken ? '▶' : '▷'; r.title = '';
      r.className = `formula-result ${taken ? 'formula-cond-true' : 'formula-cond-false'}`;
      return;
    }
    if (stmt.rowType === 'end') { r.textContent = ''; r.title = ''; r.className = 'formula-result'; return; }
    if (stmt.rowType === 'for') {
      if (stmt.error) { r.textContent = 'err'; r.title = stmt.error; r.className = 'formula-result formula-error'; }
      else { r.textContent = `${stmt.value}×`; r.title = `${stmt.value} iteration${stmt.value !== 1 ? 's' : ''}`; r.className = 'formula-result formula-loop-count'; }
      return;
    }
    if (!stmt.active) { r.textContent = '—'; r.title = 'inactive branch'; r.className = 'formula-result formula-inactive'; return; }
    if (stmt.isFn) {
      r.textContent = 'fn'; r.title = `${stmt.name}(${stmt.fnParam}) — user-defined function`; r.className = 'formula-result formula-fn';
    } else if (stmt.error) {
      r.textContent = 'err'; r.title = stmt.error; r.className = 'formula-result formula-error';
    } else {
      const unitStr = formatUnit(stmt.unit);
      r.innerHTML = fmtNum(stmt.value) + (unitStr ? ` <span class="result-unit">${transformPiece(unitStr)}</span>` : '');
      r.title = ''; r.className = 'formula-result';
    }
  });
}

/** Re-evaluate all formula blocks in canvas top-to-bottom order. */
export function reEvalAllFormulas() {
  if (!canvas) return;

  // Reset scope to global constants
  for (const k in globalScope) delete globalScope[k];
  for (const k in globalFnScope) delete globalFnScope[k];
  for (const [k, v] of Object.entries(state.constants)) globalScope[k] = { v, u: {} };

  const topLevelEls: HTMLElement[] = [
    ...Array.from(canvas.domElement.querySelectorAll<HTMLElement>('.formula-block'))
      .filter((el) => !childToSection.has(el.id)),
    ...Array.from(canvas.domElement.querySelectorAll<HTMLElement>('.section-block')),
  ].sort((a, b) => {
    const dy = parseInt(a.style.top) - parseInt(b.style.top);
    return dy !== 0 ? dy : parseInt(a.style.left) - parseInt(b.style.left);
  });

  for (const el of topLevelEls) {
    const block = state.blocks.find((b) => b.id === el.id);
    if (!block) continue;

    if (block.type === 'section') {
      const prefix = (block.sectionName || 'section1') + '__';
      const sectionScope: Scope = { ...globalScope };
      const sectionFnScope: FnScope = { ...globalFnScope };
      const sectionAliasKeys = new Set<string>();
      for (const [k, v] of Object.entries(globalScope)) {
        if (k.startsWith(prefix)) {
          const bare = k.slice(prefix.length);
          sectionScope[bare] = v;
          sectionAliasKeys.add(bare);
        }
      }
      const preKeys = new Set(Object.keys(sectionScope));

      const content = el.querySelector<HTMLElement>('.section-content');
      const childFormulaEls = content
        ? Array.from(content.querySelectorAll<HTMLElement>('.formula-block'))
            .filter((cel) => childToSection.get(cel.id) === el.id)
            .sort((a, b) => {
              const dy = parseInt(a.style.top) - parseInt(b.style.top);
              return dy !== 0 ? dy : parseInt(a.style.left) - parseInt(b.style.left);
            })
        : [];

      const summaryVars = new Set<string>();
      const summaryComps: Array<{ expr: string; pass: boolean }> = [];

      for (const cel of childFormulaEls) {
        const cBlock = state.blocks.find((b) => b.id === cel.id);
        if (!cBlock) continue;
        const rows = parseFormulaRows(cBlock.content).map((r) => ({ ...r, e: expandDotNotation(r.e) }));
        const stmts = evalFormulaRows(rows, sectionScope, sectionFnScope);
        applyEvalResults(cel, stmts);
        if (cBlock.type === 'summary') {
          for (const stmt of stmts) {
            if (!stmt.active || stmt.rowType) continue;
            if (stmt.name && !stmt.error) {
              summaryVars.add(stmt.name);
            } else if (!stmt.name && !stmt.error && COMP_RE.test(stmt.expr)) {
              summaryComps.push({ expr: stmt.raw, pass: stmt.value !== 0 });
            } else if (!stmt.name && !stmt.error && /^[a-zA-Z_]\w*$/.test(stmt.expr.trim())) {
              summaryVars.add(stmt.expr.trim());
            } else if (COMP_RE.test(stmt.raw)) {
              try {
                const result = evalExpr(stmt.raw, sectionScope, sectionFnScope);
                summaryComps.push({ expr: stmt.raw, pass: result.v !== 0 });
              } catch { /* malformed — skip */ }
            }
          }
        }
      }
      sectionSummaryVarNames.set(el.id, summaryVars);
      sectionSummaryComparisons.set(el.id, summaryComps);

      for (const [k, v] of Object.entries(sectionScope)) {
        if (!k.startsWith(prefix) && (!preKeys.has(k) || sectionAliasKeys.has(k))) {
          globalScope[`${prefix}${k}`] = v;
        }
      }
      for (const [k, v] of Object.entries(sectionScope)) {
        if (k.startsWith(prefix)) globalScope[k] = v;
      }

      // Use callback to avoid circular dependency with section.ts
      onSectionSummaryUpdate?.(el, block);
    } else {
      const rows = parseFormulaRows(block.content).map((r) => ({ ...r, e: expandDotNotation(r.e) }));
      const stmts = evalFormulaRows(rows, globalScope, globalFnScope);
      applyEvalResults(el, stmts);
    }
  }

  // Re-render all plot blocks with the updated scope
  canvas.domElement.querySelectorAll<HTMLElement>('.plot-block').forEach((el) => {
    // deno-lint-ignore no-explicit-any
    const rerender = (el as any).__plotRerender as (() => void) | undefined;
    if (rerender) rerender();
  });

  // Resize all section containers to fit their children (deferred after layout)
  // Use callback to avoid circular dependency with section.ts
  onRefreshAllSectionHeights?.();
}

// ---------------------------------------------------------------------------
// buildFormulaBlock
// ---------------------------------------------------------------------------

export function buildFormulaBlock(el: HTMLElement, block: Block) {
  el.classList.add('formula-block');

  const labelEl = document.createElement('div');
  labelEl.className = 'formula-label';
  labelEl.contentEditable = 'true';
  labelEl.textContent = block.label ?? 'Formula';
  labelEl.dataset.placeholder = 'Label…';
  labelEl.addEventListener('blur', () => { block.label = labelEl.textContent ?? ''; });
  el.appendChild(labelEl);

  const divider = document.createElement('hr');
  divider.className = 'math-divider';
  el.appendChild(divider);

  const rowsEl = document.createElement('div');
  rowsEl.className = 'formula-rows';
  el.appendChild(rowsEl);

  let lastFocusedRowIdx = -1;

  function updateHasAnyDesc() {
    const arr = parseFormulaRows(block.content);
    const anyDesc = arr.some((r) => !!r.d);
    rowsEl.classList.toggle('has-any-desc',     anyDesc);
    rowsEl.classList.toggle('has-any-row-desc', anyDesc);
  }

  function updateHasAnyRef() {
    const arr = parseFormulaRows(block.content);
    const anyRef = arr.some((r) => !!r.ref);
    rowsEl.classList.toggle('has-any-ref',     anyRef);
    rowsEl.classList.toggle('has-any-row-ref', anyRef);
  }

  function syncContent() {
    const rows = rowsEl.querySelectorAll<HTMLElement>('.formula-row');
    block.content = JSON.stringify(
      Array.from(rows).map((r) => {
        const obj: FormulaRow = { e: r.dataset.raw ?? '', d: r.dataset.desc ?? '' };
        if (r.dataset.rowType) obj.type = r.dataset.rowType as FormulaRow['type'];
        if (r.dataset.ref) obj.ref = r.dataset.ref;
        return obj;
      })
    );
    reEvalAllFormulas();
    updateHasAnyDesc();
    updateHasAnyRef();
  }

  function findBranchInsertPoint(arr: FormulaRow[], ifIdx: number): { insertIdx: number; hasElse: boolean } {
    let depth = 1;
    let hasElse = false;
    for (let j = ifIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === 'if' || t === 'for') depth++;
      if (t === 'end') { depth--; if (depth === 0) return { insertIdx: j, hasElse }; }
      if (t === 'else' && depth === 1) { hasElse = true; return { insertIdx: j, hasElse }; }
    }
    return { insertIdx: arr.length, hasElse };
  }

  function findOwningIfIdx(arr: FormulaRow[], rowIdx: number): number {
    if (arr[rowIdx]?.type === 'if') return rowIdx;
    let depth = 0;
    for (let j = rowIdx - 1; j >= 0; j--) {
      const t = arr[j].type;
      if (t === 'end') depth++;
      else if ((t === 'if' || t === 'for') && depth > 0) depth--;
      else if (t === 'if' && depth === 0) return j;
    }
    return rowIdx;
  }

  function findBlockEndIdx(arr: FormulaRow[], blockIdx: number): number {
    let depth = 1;
    for (let j = blockIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === 'if' || t === 'for') depth++;
      if (t === 'end') { depth--; if (depth === 0) return j; }
    }
    return arr.length - 1;
  }

  function findBranchBodyEnd(arr: FormulaRow[], branchIdx: number): number {
    let depth = 0;
    for (let j = branchIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === 'if' || t === 'for') depth++;
      if (t === 'end') { if (depth === 0) return j; depth--; }
      if ((t === 'elseif' || t === 'else') && depth === 0) return j;
    }
    return arr.length;
  }

  function findOwningBlockStart(arr: FormulaRow[], idx: number): number {
    let depth = 0;
    for (let j = idx - 1; j >= 0; j--) {
      const t = arr[j].type;
      if (t === 'end') depth++;
      else if ((t === 'if' || t === 'for') && depth > 0) depth--;
      else if ((t === 'if' || t === 'for') && depth === 0) return j;
    }
    return 0;
  }

  function smartDelete(arr: FormulaRow[], idx: number): number {
    const rt = arr[idx].type;
    if (!rt) {
      arr.splice(idx, 1);
      if (arr.length === 0) arr.push({ e: '', d: '' });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === 'if' || rt === 'for') {
      const endIdx = findBlockEndIdx(arr, idx);
      arr.splice(idx, endIdx - idx + 1);
      if (arr.length === 0) arr.push({ e: '', d: '' });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === 'elseif' || rt === 'else') {
      const bodyEnd = findBranchBodyEnd(arr, idx);
      arr.splice(idx, bodyEnd - idx);
      if (arr.length === 0) arr.push({ e: '', d: '' });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === 'end') {
      const ownerIdx = findOwningBlockStart(arr, idx);
      arr.splice(ownerIdx, idx - ownerIdx + 1);
      if (arr.length === 0) arr.push({ e: '', d: '' });
      return Math.min(ownerIdx, arr.length - 1);
    }
    return idx;
  }

  function findContextIfBlock(arr: FormulaRow[]): number {
    if (lastFocusedRowIdx >= 0 && lastFocusedRowIdx < arr.length) {
      const rt = arr[lastFocusedRowIdx]?.type;
      const candidate = rt === 'if'
        ? lastFocusedRowIdx
        : findOwningBlockStart(arr, lastFocusedRowIdx);
      if (arr[candidate]?.type === 'if') return candidate;
    }
    for (let j = arr.length - 1; j >= 0; j--) {
      if (arr[j].type === 'if') return j;
    }
    return -1;
  }

  function computeDepths(rowData: FormulaRow[]): number[] {
    const depths: number[] = [];
    let depth = 0;
    for (const row of rowData) {
      const rt = row.type;
      if (rt === 'elseif' || rt === 'else' || rt === 'end') depth = Math.max(0, depth - 1);
      depths.push(depth);
      if (rt === 'if' || rt === 'for' || rt === 'elseif' || rt === 'else') depth++;
    }
    return depths;
  }

  function rebuildRows() {
    const rowData = parseFormulaRows(block.content);
    rowsEl.innerHTML = '';
    block.content = JSON.stringify(rowData);

    // deno-lint-ignore no-explicit-any
    if (!(rowsEl as any)._rowUndoStack) (rowsEl as any)._rowUndoStack = [];
    // deno-lint-ignore no-explicit-any
    const rowUndoStack: FormulaRow[] & { idx?: number }[] = (rowsEl as any)._rowUndoStack;

    const depths = computeDepths(rowData);
    const containerStack: HTMLElement[] = [rowsEl];
    const peekContainer = () => containerStack[containerStack.length - 1];

    rowData.forEach((rowDatum, i) => {
      const { e: stmt, d: desc, ref, type: rowType } = rowDatum;
      const isCtrl = !!rowType;
      const isBodyOnly = rowType === 'else' || rowType === 'end';

      const row = document.createElement('div');
      row.className = 'formula-row';
      if (isCtrl) row.classList.add('formula-row--control');
      if (isBodyOnly) row.classList.add('formula-row--no-expr');
      if (rowType) row.dataset.rowType = rowType;
      row.dataset.raw  = stmt;
      row.dataset.desc = desc ?? '';
      row.dataset.ref  = ref ?? '';
      if (desc) row.classList.add('has-desc');
      if (ref)  row.classList.add('has-ref');

      const d = depths[i] ?? 0;
      row.style.setProperty('--depth', String(d));

      if (isCtrl) {
        const badge = document.createElement('span');
        badge.className = `formula-keyword formula-keyword--${rowType}`;
        badge.textContent = rowType!;

        if (isBodyOnly) {
          badge.tabIndex = 0;
          badge.addEventListener('focus', () => { lastFocusedRowIdx = i; });
          badge.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (!ev.ctrlKey || ev.key !== '-' || ev.shiftKey || ev.altKey) return;
            ev.preventDefault();
            ev.stopPropagation();
            const arr = parseFormulaRows(block.content);
            const allRowEls = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-row'));
            const rowIdx = allRowEls.indexOf(row);
            rowUndoStack.push(Object.assign({}, arr[rowIdx], { idx: rowIdx }));
            const refocusIdx = smartDelete(arr, rowIdx);
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const cells = rowsEl.querySelectorAll<HTMLElement>('.formula-cell:not([style*="display: none"])');
            (cells[Math.min(refocusIdx, cells.length - 1)] as HTMLElement | undefined)?.focus();
          });
        }

        row.appendChild(badge);
      } else {
        const descWrap = document.createElement('div');
        descWrap.className = 'formula-desc-wrap';

        const descCell = document.createElement('div');
        descCell.contentEditable = 'true';
        descCell.className = 'formula-desc-cell';
        descCell.dataset.placeholder = 'Description…';

        const renderDesc = () => {
          const html = renderInlineMd(row.dataset.desc ?? '');
          if (html) descCell.innerHTML = html;
          else descCell.textContent = '';
        };
        descCell.addEventListener('focus', () => {
          descCell.innerText = row.dataset.desc ?? '';
          const range = document.createRange();
          range.selectNodeContents(descCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        descCell.addEventListener('input', () => { row.dataset.desc = serializeEditable(descCell); });
        descCell.addEventListener('blur', () => {
          row.dataset.desc = serializeEditable(descCell);
          if (row.dataset.desc) row.classList.add('has-desc');
          else row.classList.remove('has-desc');
          syncContent();
          updateHasAnyDesc();
          renderDesc();
        });
        descCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && !ev.shiftKey) { ev.preventDefault(); cell.focus(); }
          if (ev.key === 'Enter') { ev.preventDefault(); insertLineBreak(); }
        });
        renderDesc();

        descWrap.appendChild(descCell);
        row.appendChild(descWrap);
      }

      const exprSide = document.createElement('div');
      exprSide.className = 'formula-expr-side';

      const cell = document.createElement('div');
      cell.className = 'formula-cell';

      if (isBodyOnly) {
        cell.style.display = 'none';
      } else {
        cell.contentEditable = 'true';
        const PLAIN_TYPES = new Set(['if', 'elseif', 'for']);
        const renderMath = () => {
          if (PLAIN_TYPES.has(row.dataset.rowType ?? '')) {
            cell.textContent = row.dataset.raw ?? '';
          } else {
            const html = prettifyExpr(row.dataset.raw ?? '');
            if (html) cell.innerHTML = html;
            else cell.textContent = row.dataset.raw ?? '';
          }
        };

        if (rowType === 'if' || rowType === 'elseif') {
          cell.dataset.placeholder = 'condition  e.g. x > 0';
        } else if (rowType === 'for') {
          cell.dataset.placeholder = 'i = 1 to n';
        } else {
          cell.dataset.placeholder = 'x = expression';
        }

        cell.addEventListener('focus', () => {
          lastFocusedRowIdx = i;
          cell.textContent = row.dataset.raw ?? '';
          const range = document.createRange();
          range.selectNodeContents(cell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        cell.addEventListener('blur', () => {
          row.dataset.raw = cell.textContent?.trim() ?? '';
          syncContent();
          renderMath();
        });
        cell.addEventListener('input', () => {
          row.dataset.raw = cell.textContent ?? '';
          syncContent();
        });

        cell.addEventListener('keydown', (e: KeyboardEvent) => {
          const k = e.key;
          if (k === 'Enter' && e.altKey && !e.ctrlKey) { e.preventDefault(); return; }
          if (!e.ctrlKey) return;
          if (k !== 'Enter' && k !== '-' && k.toLowerCase() !== 'z' &&
              k.toLowerCase() !== 'i' && k.toLowerCase() !== 'l' &&
              k.toLowerCase() !== 'e') return;
          e.preventDefault();
          e.stopPropagation();

          row.dataset.raw = cell.textContent?.trim() ?? '';
          const arr = parseFormulaRows(block.content);
          const allRows = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-row'));
          const idx = allRows.indexOf(row);

          const refocus = (targetIdx: number) => {
            rebuildRows();
            reEvalAllFormulas();
            const newCells = rowsEl.querySelectorAll<HTMLElement>('.formula-cell:not([style*="display: none"])');
            newCells[Math.max(0, Math.min(targetIdx, newCells.length - 1))]?.focus();
          };

          if (k === 'Enter' && !e.altKey) {
            arr.splice(idx + 1, 0, { e: '', d: '' });
            block.content = JSON.stringify(arr);
            refocus(idx + 1);
          } else if (k === 'Enter' && e.altKey) {
            arr.splice(idx, 0, { e: '', d: '' });
            block.content = JSON.stringify(arr);
            refocus(idx);
          } else if (k === '-' && !e.shiftKey && !e.altKey) {
            rowUndoStack.push(Object.assign({}, arr[idx], { idx }));
            const refocusIdx = smartDelete(arr, idx);
            block.content = JSON.stringify(arr);
            refocus(refocusIdx);
          } else if (k.toLowerCase() === 'z' && e.shiftKey && !e.altKey) {
            const entry = rowUndoStack.pop();
            if (!entry) return;
            const restoreIdx = (entry as { idx?: number }).idx ?? idx;
            arr.splice(restoreIdx, 0, { e: entry.e, d: entry.d ?? '', type: entry.type });
            block.content = JSON.stringify(arr);
            refocus(restoreIdx);
          } else if (k.toLowerCase() === 'i' && !e.altKey && !e.shiftKey) {
            arr.splice(idx + 1, 0,
              { e: '', d: '', type: 'if' },
              { e: '', d: '' },
              { e: '', d: '', type: 'end' },
            );
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const allCells = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-cell'));
            allCells[idx + 2]?.focus();
          } else if (k.toLowerCase() === 'l' && !e.altKey && !e.shiftKey) {
            arr.splice(idx + 1, 0,
              { e: 'i = 1 to n', d: '', type: 'for' },
              { e: '', d: '' },
              { e: '', d: '', type: 'end' },
            );
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const allCells = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-cell'));
            allCells[idx + 1]?.focus();
          } else if (k.toLowerCase() === 'e' && (rowType === 'if' || rowType === 'elseif')) {
            const ownerIdx = findOwningIfIdx(arr, idx);
            const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
            if (insertIdx < 0 || hasElse) return;
            if (e.shiftKey) {
              arr.splice(insertIdx, 0,
                { e: '', d: '', type: 'else' },
                { e: '', d: '' },
              );
            } else {
              arr.splice(insertIdx, 0,
                { e: '', d: '', type: 'elseif' },
                { e: '', d: '' },
              );
            }
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const newAllCells = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-cell'));
            newAllCells[insertIdx]?.focus();
          }
        });

        renderMath();
      }

      const sep = document.createElement('span');
      sep.className = 'formula-sep';
      if (isBodyOnly) {
        sep.style.display = 'none';
      } else if (isCtrl) {
        sep.textContent = ' → ';
      } else {
        sep.textContent = ' = ';
      }

      const resultEl = document.createElement('span');
      resultEl.className = 'formula-result';
      resultEl.dataset.result = String(i);
      resultEl.textContent = isBodyOnly ? '' : '—';

      exprSide.appendChild(cell);
      exprSide.appendChild(sep);
      exprSide.appendChild(resultEl);
      row.appendChild(exprSide);

      const refWrap = document.createElement('div');
      refWrap.className = 'formula-ref-wrap';

      if (!isCtrl) {
        const refCell = document.createElement('div');
        refCell.contentEditable = 'true';
        refCell.className = 'formula-ref-cell';
        refCell.dataset.placeholder = 'Reference…';
        if (ref) refCell.innerText = ref;

        refCell.addEventListener('focus', () => {
          refCell.innerText = row.dataset.ref ?? '';
          const range = document.createRange();
          range.selectNodeContents(refCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        refCell.addEventListener('input', () => { row.dataset.ref = serializeEditable(refCell); });
        refCell.addEventListener('blur', () => {
          row.dataset.ref = serializeEditable(refCell);
          if (row.dataset.ref) row.classList.add('has-ref');
          else row.classList.remove('has-ref');
          syncContent();
          updateHasAnyRef();
        });
        refCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && ev.shiftKey) { ev.preventDefault(); cell.focus(); }
          if (ev.key === 'Enter') { ev.preventDefault(); insertLineBreak(); }
        });

        refWrap.appendChild(refCell);
      }

      row.appendChild(refWrap);

      if (rowType === 'if' || rowType === 'for') {
        const group = document.createElement('div');
        group.className = 'formula-block-group';
        if (desc) group.classList.add('has-group-desc');
        if (ref)  group.classList.add('has-group-ref');

        const groupDescWrap = document.createElement('div');
        groupDescWrap.className = 'formula-desc-wrap';
        const groupDescCell = document.createElement('div');
        groupDescCell.contentEditable = 'true';
        groupDescCell.className = 'formula-desc-cell';
        groupDescCell.dataset.placeholder = 'Description…';
        const renderGroupDesc = () => {
          const html = renderInlineMd(row.dataset.desc ?? '');
          if (html) groupDescCell.innerHTML = html;
          else groupDescCell.textContent = '';
        };
        groupDescCell.addEventListener('focus', () => {
          groupDescCell.innerText = row.dataset.desc ?? '';
          const range = document.createRange();
          range.selectNodeContents(groupDescCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        groupDescCell.addEventListener('input', () => { row.dataset.desc = serializeEditable(groupDescCell); });
        groupDescCell.addEventListener('blur', () => {
          row.dataset.desc = serializeEditable(groupDescCell);
          if (row.dataset.desc) { row.classList.add('has-desc'); group.classList.add('has-group-desc'); }
          else { row.classList.remove('has-desc'); group.classList.remove('has-group-desc'); }
          syncContent();
          updateHasAnyDesc();
          renderGroupDesc();
        });
        groupDescCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && !ev.shiftKey) { ev.preventDefault(); cell.focus(); }
          if (ev.key === 'Enter') { ev.preventDefault(); insertLineBreak(); }
        });
        renderGroupDesc();
        groupDescWrap.appendChild(groupDescCell);
        group.appendChild(groupDescWrap);

        const inner = document.createElement('div');
        inner.className = 'formula-block-inner';
        group.appendChild(inner);

        const groupRefWrap = document.createElement('div');
        groupRefWrap.className = 'formula-ref-wrap';
        const groupRefCell = document.createElement('div');
        groupRefCell.contentEditable = 'true';
        groupRefCell.className = 'formula-ref-cell';
        groupRefCell.dataset.placeholder = 'Reference…';
        if (ref) groupRefCell.innerText = ref;
        groupRefCell.addEventListener('focus', () => {
          groupRefCell.innerText = row.dataset.ref ?? '';
          const range = document.createRange();
          range.selectNodeContents(groupRefCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        groupRefCell.addEventListener('input', () => { row.dataset.ref = serializeEditable(groupRefCell); });
        groupRefCell.addEventListener('blur', () => {
          row.dataset.ref = serializeEditable(groupRefCell);
          if (row.dataset.ref) { row.classList.add('has-ref'); group.classList.add('has-group-ref'); }
          else { row.classList.remove('has-ref'); group.classList.remove('has-group-ref'); }
          syncContent();
          updateHasAnyRef();
        });
        groupRefCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && ev.shiftKey) { ev.preventDefault(); cell.focus(); }
          if (ev.key === 'Enter') { ev.preventDefault(); insertLineBreak(); }
        });
        groupRefWrap.appendChild(groupRefCell);
        group.appendChild(groupRefWrap);

        peekContainer().appendChild(group);
        containerStack.push(inner);
        inner.appendChild(row);
      } else if (rowType === 'end') {
        peekContainer().appendChild(row);
        if (containerStack.length > 1) containerStack.pop();
      } else {
        peekContainer().appendChild(row);
      }
    });

    updateHasAnyDesc();
    updateHasAnyRef();
  }

  // ── Context menu action callbacks stored on rowsEl ──────────────────────
  const getRowIdx = (rowEl: HTMLElement): number =>
    Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-row')).indexOf(rowEl);

  const ctxRefocus = (idx: number) => {
    rebuildRows();
    reEvalAllFormulas();
    const cells = rowsEl.querySelectorAll<HTMLElement>('.formula-cell:not([style*="display: none"])');
    (cells[Math.max(0, Math.min(idx, cells.length - 1))] as HTMLElement | undefined)?.focus();
  };

  // deno-lint-ignore no-explicit-any
  (rowsEl as any)._formulaCtxActions = {
    getRowState: (rowEl: HTMLElement | null) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : -1;
      const rowType = (rowEl?.dataset.rowType ?? null) as FormulaRow['type'] | null;
      const hasIf = arr.some((r) => r.type === 'if');
      let hasElse = false;
      if (hasIf) {
        const ownerIdx = idx >= 0
          ? (arr[idx]?.type === 'if' ? idx : findOwningBlockStart(arr, idx))
          : findContextIfBlock(arr);
        if (ownerIdx >= 0 && arr[ownerIdx]?.type === 'if') {
          ({ hasElse } = findBranchInsertPoint(arr, ownerIdx));
        }
      }
      const canDelBranch = rowType === 'elseif' || rowType === 'else' || rowType === 'for';
      return { rowType, hasIf, hasElse, canDelBranch };
    },

    insertRowAfter: (rowEl: HTMLElement | null) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, { e: '', d: '' });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 1);
    },

    insertIfAfter: (rowEl: HTMLElement | null) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0,
        { e: '', d: '', type: 'if' },
        { e: '', d: '' },
        { e: '', d: '', type: 'end' },
      );
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 2);
    },

    insertForAfter: (rowEl: HTMLElement | null) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0,
        { e: 'i = 1 to n', d: '', type: 'for' },
        { e: '', d: '' },
        { e: '', d: '', type: 'end' },
      );
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 1);
    },

    insertElseifFor: (rowEl: HTMLElement | null) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : lastFocusedRowIdx;
      const ownerIdx = idx >= 0
        ? (arr[idx]?.type === 'if' ? idx : findOwningIfIdx(arr, idx))
        : findContextIfBlock(arr);
      if (ownerIdx < 0) return;
      const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
      if (hasElse) return;
      arr.splice(insertIdx, 0,
        { e: '', d: '', type: 'elseif' },
        { e: '', d: '' },
      );
      block.content = JSON.stringify(arr);
      ctxRefocus(insertIdx);
    },

    insertElseFor: (rowEl: HTMLElement | null) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : lastFocusedRowIdx;
      const ownerIdx = idx >= 0
        ? (arr[idx]?.type === 'if' ? idx : findOwningIfIdx(arr, idx))
        : findContextIfBlock(arr);
      if (ownerIdx < 0) return;
      const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
      if (hasElse) return;
      arr.splice(insertIdx, 0,
        { e: '', d: '', type: 'else' },
        { e: '', d: '' },
      );
      block.content = JSON.stringify(arr);
      ctxRefocus(insertIdx + 1);
    },

    smartDeleteRow: (rowEl: HTMLElement) => {
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      if (idx < 0) return;
      // deno-lint-ignore no-explicit-any
      const undoStack: Array<FormulaRow & { idx?: number }> = (rowsEl as any)._rowUndoStack ?? [];
      undoStack.push(Object.assign({}, arr[idx], { idx }));
      // deno-lint-ignore no-explicit-any
      (rowsEl as any)._rowUndoStack = undoStack;
      const refocusIdx = smartDelete(arr, idx);
      block.content = JSON.stringify(arr);
      ctxRefocus(refocusIdx);
    },

    addDescription: (rowEl: HTMLElement) => {
      const rt = rowEl.dataset.rowType;
      let descCell: HTMLElement | null;
      if (rt === 'if' || rt === 'for') {
        const group = rowEl.closest<HTMLElement>('.formula-block-group');
        descCell = group?.querySelector<HTMLElement>(':scope > .formula-desc-wrap .formula-desc-cell') ?? null;
        if (descCell) { rowEl.classList.add('has-desc'); group?.classList.add('has-group-desc'); rowsEl.classList.add('has-any-desc'); rowsEl.classList.add('has-any-row-desc'); }
      } else {
        descCell = rowEl.querySelector<HTMLElement>('.formula-desc-cell');
        if (descCell) { rowEl.classList.add('has-desc'); rowsEl.classList.add('has-any-row-desc'); rowsEl.classList.add('has-any-desc'); }
      }
      if (!descCell) return;
      descCell.focus();
    },

    isRegularRow: (rowEl: HTMLElement | null) => !rowEl?.dataset.rowType,
    hasDescription: (rowEl: HTMLElement | null) => !!rowEl?.classList.contains('has-desc'),

    addReference: (rowEl: HTMLElement) => {
      const rt = rowEl.dataset.rowType;
      let refCell: HTMLElement | null;
      if (rt === 'if' || rt === 'for') {
        const group = rowEl.closest<HTMLElement>('.formula-block-group');
        refCell = group?.querySelector<HTMLElement>(':scope > .formula-ref-wrap .formula-ref-cell') ?? null;
        if (refCell) { rowEl.classList.add('has-ref'); group?.classList.add('has-group-ref'); rowsEl.classList.add('has-any-ref'); rowsEl.classList.add('has-any-row-ref'); }
      } else {
        refCell = rowEl.querySelector<HTMLElement>('.formula-ref-cell');
        if (refCell) { rowEl.classList.add('has-ref'); rowsEl.classList.add('has-any-row-ref'); rowsEl.classList.add('has-any-ref'); }
      }
      if (!refCell) return;
      refCell.focus();
    },

    hasReference: (rowEl: HTMLElement | null) => !!rowEl?.classList.contains('has-ref'),
  };

  rebuildRows();
}
