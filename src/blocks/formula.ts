// ---------------------------------------------------------------------------
// Formula block — editable rows with live evaluation, control-flow, and units
// ---------------------------------------------------------------------------

import {
  evalExpr,
  evalFormulaRows,
  expandDotNotation,
  type FnScope,
  formatUnit,
  type FormulaRow,
  inputUnitKindOf,
  type Quantity,
  type Scope,
  splitInputRow,
  type Statement,
  validateInputValue,
} from '../expr.ts';
import { type Block, sectionPrefix } from '../types.ts';
import {
  canvas,
  CANVAS_W,
  childToSection,
  globalFnScope,
  globalScope,
  margins,
  onRefreshAllSectionHeights,
  onSectionSummaryUpdate,
  sectionSummaryComparisons,
  sectionSummaryVarNames,
  state,
} from '../state.ts';
import { prettifyExpr, renderInlineMd, transformUnit } from '../utils/markdown.ts';

/** Regex that detects comparison operators in a raw expression string. */
const COMP_RE = /[<>]=?|[!=]=/;

// ---------------------------------------------------------------------------
// Pure computation helpers
// ---------------------------------------------------------------------------

/** Significant digits a result is displayed to when a row does not say otherwise. */
export const SIG_DEFAULT = 6;

/**
 * Format a result for display. **Display only** — the stored value is always the full double, so
 * nothing downstream ever sees the rounded number.
 *
 * Two behaviours were fixed here on 2026-09-23:
 *  - Precision was hard-coded at 6 significant digits; it is now per row (`FormulaRow.sd`).
 *  - Grouping was inconsistent. Whole numbers went through `toLocaleString` and got separators,
 *    everything else went through `toString` and got none — so `29000` read as "29,000" while
 *    `1234567.891` read as "1234570": rounded away at the integer part AND ungrouped. A moment in
 *    lb·ft is exactly the kind of number that hits that path.
 */
// WASM-READY: (f64, f64) -> string
export function fmtNum(n: number, sig: number = SIG_DEFAULT): string {
  if (!isFinite(n)) return String(n);
  if (n === 0) return '0';
  const rounded = parseFloat(n.toPrecision(Math.max(1, Math.min(15, Math.round(sig)))));
  const abs = Math.abs(rounded);
  // Outside this band no amount of grouping helps. Exponential is stated explicitly rather than
  // left to toString(), which only switches over at 1e21 — so 1e20 came out as twenty-one digits.
  if (abs >= 1e15 || abs < 1e-6) return rounded.toExponential();
  const decimals = (rounded.toString().split('.')[1] ?? '').length;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
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
        // Single spacing is the default and is never stored — with no block-vs-row cascade,
        // an absent `sp` and `sp: 1` mean exactly the same thing.
        if (Number(r.sp) > 1) row.sp = Number(r.sp);
        // Likewise the default precision is never stored.
        const sd = Number(r.sd);
        if (Number.isFinite(sd) && sd >= 1 && sd <= 15 && sd !== SIG_DEFAULT) {
          row.sd = Math.round(sd);
        }
        if (r.in) row.in = String(r.in);
        if (r.uk) row.uk = String(r.uk);
        if (r.lk) row.lk = true;
        return row;
      });
    }
  } catch {
    // Content that STARTS like JSON but fails to parse is corrupt, not legacy. Falling through
    // to the semicolon split would shred a truncated JSON blob into nonsense rows — and
    // syncContent() would then write that interpretation back over the original on the next
    // keystroke. Keep the raw text intact in a single row instead: it is visible, it is still
    // recoverable by hand, and nothing is silently rewritten.
    if (content.trimStart().startsWith('[')) {
      console.error('Formula block content is not valid JSON; preserving it as raw text.');
      return [{ e: content, d: '' }];
    }
    /* otherwise fall through — genuine legacy semicolon format */
  }
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
  if (
    !br.nextSibling ||
    (br.nextSibling.nodeType === Node.TEXT_NODE && br.nextSibling.textContent === '')
  ) {
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

/** A matrix result as a bracketed grid; every element shows its own value and unit. */
export function matrixResultHtml(m: Quantity[][], sig: number = SIG_DEFAULT): string {
  const cells = m.flat().map((q) => {
    const u = formatUnit(q.u);
    return `<span>${fmtNum(q.v, sig)}${
      u ? ` <span class="result-unit">${transformUnit(u)}</span>` : ''
    }</span>`;
  }).join('');
  return `<span class="mat" style="grid-template-columns: repeat(${
    m[0].length
  }, auto)">${cells}</span>`;
}

/** Apply evalFormulaRows results to a formula block's DOM result spans. */
export function applyEvalResults(formulaEl: HTMLElement, stmts: Statement[]) {
  const rowEls = Array.from(formulaEl.querySelectorAll<HTMLElement>('.formula-row'));
  stmts.forEach((stmt, i) => {
    const rowEl = rowEls[i];
    if (rowEl) {
      rowEl.classList.toggle('formula-row--inactive', stmt.active === false && !stmt.rowType);
    }

    const r = formulaEl.querySelector<HTMLElement>(`[data-result="${i}"]`);
    if (!r) return;

    // Display precision for this row, set from the context menu and stored on the row.
    const sig = Number(rowEl?.dataset.sd) || SIG_DEFAULT;

    if (stmt.rowType === 'if' || stmt.rowType === 'elseif') {
      const taken = (stmt.condValue ?? 0) !== 0 && !stmt.error;
      if (stmt.error) {
        r.textContent = 'err';
        r.title = stmt.error;
        r.className = 'formula-result formula-error';
      } else {
        r.textContent = taken ? '▶ true' : '▷ false';
        r.title = '';
        r.className = `formula-result ${taken ? 'formula-cond-true' : 'formula-cond-false'}`;
      }
      return;
    }
    if (stmt.rowType === 'else') {
      const taken = (stmt.condValue ?? 0) !== 0;
      r.textContent = taken ? '▶' : '▷';
      r.title = '';
      r.className = `formula-result ${taken ? 'formula-cond-true' : 'formula-cond-false'}`;
      return;
    }
    if (stmt.rowType === 'end') {
      r.textContent = '';
      r.title = '';
      r.className = 'formula-result';
      return;
    }
    if (stmt.rowType === 'for') {
      if (stmt.error) {
        r.textContent = 'err';
        r.title = stmt.error;
        r.className = 'formula-result formula-error';
      } else {
        r.textContent = `${stmt.value}×`;
        r.title = `${stmt.value} iteration${stmt.value !== 1 ? 's' : ''}`;
        r.className = 'formula-result formula-loop-count';
      }
      return;
    }
    if (!stmt.active) {
      r.textContent = '—';
      r.title = 'inactive branch';
      r.className = 'formula-result formula-inactive';
      return;
    }
    if (stmt.isFn) {
      r.textContent = 'fn';
      r.title = `${stmt.name}(${stmt.fnParam}) — user-defined function`;
      r.className = 'formula-result formula-fn';
    } else if (stmt.error) {
      r.textContent = 'err';
      r.title = stmt.error;
      r.className = 'formula-result formula-error';
    } else if (stmt.matrix) {
      r.innerHTML = matrixResultHtml(stmt.matrix, sig);
      r.title = `${stmt.matrix.length}×${stmt.matrix[0].length} matrix`;
      r.className = 'formula-result';
    } else if (stmt.isTest) {
      // A comparison is a check, so it reads as a check: OK or NG, not 1 or 0.
      const pass = stmt.value !== 0;
      r.textContent = pass ? 'OK' : 'NG';
      r.title = pass ? 'Check passes' : 'Check does not pass';
      r.className = `formula-result ${pass ? 'formula-check-ok' : 'formula-check-ng'}`;
    } else {
      const unitStr = formatUnit(stmt.unit);
      r.innerHTML = fmtNum(stmt.value, sig) +
        (unitStr ? ` <span class="result-unit">${transformUnit(unitStr)}</span>` : '');
      // The full stored value on hover — the display is rounded, the number never is.
      r.title = String(stmt.value);
      r.className = 'formula-result';
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
      const prefix = sectionPrefix(block.sectionName);
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

      const summaryVars = new Map<string, string>(); // name → spelling as typed
      const summaryComps: Array<{ expr: string; pass: boolean; error?: string }> = [];

      for (const cel of childFormulaEls) {
        const cBlock = state.blocks.find((b) => b.id === cel.id);
        if (!cBlock) continue;
        const rows = parseFormulaRows(cBlock.content).map((r) => ({
          ...r,
          e: expandDotNotation(r.e),
        }));
        const stmts = evalFormulaRows(rows, sectionScope, sectionFnScope);
        applyEvalResults(cel, stmts);
        if (cBlock.type === 'summary') {
          for (const stmt of stmts) {
            if (!stmt.active || stmt.rowType) continue;
            if (stmt.name && !stmt.error) {
              summaryVars.set(stmt.name, stmt.raw.slice(0, stmt.raw.indexOf('=')).trim());
            } else if (!stmt.name && !stmt.error && COMP_RE.test(stmt.expr)) {
              summaryComps.push({ expr: stmt.raw, pass: stmt.value !== 0 });
            } else if (!stmt.name && !stmt.error && /^[a-zA-Z_]\w*$/.test(stmt.expr.trim())) {
              summaryVars.set(stmt.expr.trim(), stmt.raw.trim());
            } else if (COMP_RE.test(stmt.raw)) {
              try {
                const result = evalExpr(stmt.raw, sectionScope, sectionFnScope);
                summaryComps.push({ expr: stmt.raw, pass: result.v !== 0 });
              } catch (e) {
                // Report it, do NOT skip. A check that fails to evaluate used to vanish from the
                // summary entirely, so the line showed only the checks that worked — all ticks —
                // and a reader had no way to know one was missing. A silently absent check reads
                // as a passing one.
                summaryComps.push({
                  expr: stmt.raw,
                  pass: false,
                  error: (e as Error).message,
                });
              }
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
      const rows = parseFormulaRows(block.content).map((r) => ({
        ...r,
        e: expandDotNotation(r.e),
      }));
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
  if (block.w) el.style.width = `${block.w}px`;

  const labelEl = document.createElement('div');
  labelEl.className = 'formula-label';
  labelEl.contentEditable = 'true';
  labelEl.textContent = block.label ?? 'Formula';
  labelEl.dataset.placeholder = 'Label…';
  labelEl.addEventListener('blur', () => {
    block.label = labelEl.textContent ?? '';
  });
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
    rowsEl.classList.toggle('has-any-desc', anyDesc);
    rowsEl.classList.toggle('has-any-row-desc', anyDesc);
  }

  function updateHasAnyRef() {
    const arr = parseFormulaRows(block.content);
    const anyRef = arr.some((r) => !!r.ref);
    rowsEl.classList.toggle('has-any-ref', anyRef);
    rowsEl.classList.toggle('has-any-row-ref', anyRef);
  }

  function syncContent() {
    const rows = rowsEl.querySelectorAll<HTMLElement>('.formula-row');
    block.content = JSON.stringify(
      Array.from(rows).map((r) => {
        const obj: FormulaRow = { e: r.dataset.raw ?? '', d: r.dataset.desc ?? '' };
        if (r.dataset.rowType) obj.type = r.dataset.rowType as FormulaRow['type'];
        if (r.dataset.ref) obj.ref = r.dataset.ref;
        // Line spacing lives on the element too, because this runs on every keystroke and blur:
        // anything not read back here is silently erased from the block. Leaving `sp` out wiped
        // every row's spacing the moment the user typed (reported 2026-09-23).
        if (r.dataset.sp) obj.sp = Number(r.dataset.sp);
        if (r.dataset.sd) obj.sd = Number(r.dataset.sd);
        // Same reason as `sp` above: an author-declared input row that is not read back here
        // stops being an input row the first time anyone types in the block, and its stable id
        // — the thing every saved value is keyed to — is gone for good.
        if (r.dataset.inputId) obj.in = r.dataset.inputId;
        if (r.dataset.uk) obj.uk = r.dataset.uk;
        // `lk` is the row's OWN lock only. A row locked because it sits in a pack block is not
        // marked here: that lock comes from the block and must not be baked into the row, or
        // exporting the sheet from the pack would carry a lock nobody can explain.
        if (r.dataset.lk) obj.lk = true;
        return obj;
      }),
    );
    reEvalAllFormulas();
    updateHasAnyDesc();
    updateHasAnyRef();
  }

  function findBranchInsertPoint(
    arr: FormulaRow[],
    ifIdx: number,
  ): { insertIdx: number; hasElse: boolean } {
    let depth = 1;
    let hasElse = false;
    for (let j = ifIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === 'if' || t === 'for') depth++;
      if (t === 'end') {
        depth--;
        if (depth === 0) return { insertIdx: j, hasElse };
      }
      if (t === 'else' && depth === 1) {
        hasElse = true;
        return { insertIdx: j, hasElse };
      }
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
      if (t === 'end') {
        depth--;
        if (depth === 0) return j;
      }
    }
    return arr.length - 1;
  }

  function findBranchBodyEnd(arr: FormulaRow[], branchIdx: number): number {
    let depth = 0;
    for (let j = branchIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === 'if' || t === 'for') depth++;
      if (t === 'end') {
        if (depth === 0) return j;
        depth--;
      }
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

  /**
   * Fold the user's saved entries into the rows they belong to.
   *
   * Values are matched on the author's stable `in` id, never on position: a template that gains
   * a row above an input must still find that input's value, and matching by index would quietly
   * shift every saved number onto the wrong row. An id with no matching row is left alone in
   * `block.inputs` rather than discarded — the row may come back in a later version of the pack.
   */
  function applyInputOverlay(rows: FormulaRow[]) {
    const saved = block.inputs;
    if (!saved) return;
    for (const r of rows) {
      if (!r.in) continue;
      const v = saved[r.in];
      if (v === undefined) continue;
      r.e = `${splitInputRow(r.e).name} = ${v}`;
    }
  }

  /**
   * Whether this block's content came from a purchased pack.
   *
   * A formula block inside a pack section is an ordinary child block — the `packId` lives on the
   * section above it, so the parent has to be consulted. Everything in such a block except its
   * declared input rows is read-only: the plaintext is never written back (the serializer
   * re-emits the ciphertext), so an edit here was being accepted on screen and silently dropped
   * on save. Refusing the edit is the honest version of what already happened.
   */
  function inPurchasedPack(): boolean {
    if (block.packId) return true;
    const parentId = block.parentSectionId ?? childToSection.get(block.id);
    if (!parentId) return false;
    return !!state.blocks.find((b) => b.id === parentId)?.packId;
  }

  function rebuildRows() {
    const rowData = parseFormulaRows(block.content);
    const packLocked = inPurchasedPack();
    applyInputOverlay(rowData);
    rowsEl.innerHTML = '';
    block.content = JSON.stringify(rowData);

    // deno-lint-ignore no-explicit-any
    if (!(rowsEl as any)._rowUndoStack) (rowsEl as any)._rowUndoStack = [];
    // `FormulaRow[] & { idx?: number }[]` — the previous annotation — parses as an INTERSECTION
    // of two array types, not an array of rows carrying an index. The `as any` on the right meant
    // the mistake was never challenged, and the same stack is typed correctly further down.
    // deno-lint-ignore no-explicit-any
    const rowUndoStack: Array<FormulaRow & { idx?: number }> = (rowsEl as any)._rowUndoStack;

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
      row.dataset.raw = stmt;
      row.dataset.desc = desc ?? '';
      row.dataset.ref = ref ?? '';
      if (desc) row.classList.add('has-desc');
      if (ref) row.classList.add('has-ref');

      const d = depths[i] ?? 0;
      row.style.setProperty('--depth', String(d));

      // Line spacing is the row's own property — the block-level control stamps its value into
      // every row rather than cascading, so --row-space is the only thing the CSS reads.
      // It is mirrored into dataset so syncContent() can round-trip it; 1 (single) is the default
      // and is never stored, so absent and 1 mean the same thing.
      if (rowDatum.sp && rowDatum.sp > 1) {
        row.dataset.sp = String(rowDatum.sp);
        row.style.setProperty('--row-space', String(rowDatum.sp));
      }
      // Display precision, same arrangement: the row owns it, and dataset carries it so
      // syncContent can round-trip it. applyEvalResults reads it back off the row element.
      if (rowDatum.sd) row.dataset.sd = String(rowDatum.sd);

      // An author-declared input. Control rows can never be one: `if`/`for` take a condition,
      // not a value.
      const inputId = isCtrl ? undefined : rowDatum.in;
      if (inputId) {
        row.dataset.inputId = inputId;
        row.classList.add('formula-row--input');
        if (rowDatum.uk) row.dataset.uk = rowDatum.uk;
      }

      // Two independent reasons a row cannot be typed into, resolved to one answer. An input row
      // is never locked by the pack — being editable inside an otherwise sealed template is the
      // entire purpose of declaring it — but the author can still lock one explicitly.
      if (rowDatum.lk) row.dataset.lk = '1';
      const locked = !!rowDatum.lk || (packLocked && !inputId);
      if (locked) {
        row.classList.add('formula-row--readonly');
        if (!inputId) row.dataset.locked = '1';
      }
      const lockNote = rowDatum.lk
        ? 'Locked — unlock from the right-click menu to edit'
        : 'Set by the purchased template — only its input fields can be changed';

      if (isCtrl) {
        const badge = document.createElement('span');
        badge.className = `formula-keyword formula-keyword--${rowType}`;
        badge.textContent = rowType!;

        if (isBodyOnly) {
          badge.tabIndex = 0;
          badge.addEventListener('focus', () => {
            lastFocusedRowIdx = i;
          });
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
            const cells = rowsEl.querySelectorAll<HTMLElement>(
              '.formula-cell:not([style*="display: none"])',
            );
            (cells[Math.min(refocusIdx, cells.length - 1)] as HTMLElement | undefined)?.focus();
          });
        }

        row.appendChild(badge);
      } else {
        const descWrap = document.createElement('div');
        descWrap.className = 'formula-desc-wrap';

        const descCell = document.createElement('div');
        descCell.contentEditable = String(!locked);
        descCell.className = 'formula-desc-cell';
        if (locked) {
          descCell.classList.add('formula-cell--readonly');
          descCell.title = lockNote;
        }
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
        descCell.addEventListener('input', () => {
          row.dataset.desc = serializeEditable(descCell);
        });
        descCell.addEventListener('blur', () => {
          row.dataset.desc = serializeEditable(descCell);
          if (row.dataset.desc) row.classList.add('has-desc');
          else row.classList.remove('has-desc');
          syncContent();
          updateHasAnyDesc();
          renderDesc();
        });
        descCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && !ev.shiftKey) {
            ev.preventDefault();
            // On an input row the expression cell is the locked name; Tab belongs in the value.
            (inputValueCell ?? cell).focus();
          }
          if (ev.key === 'Enter') {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        renderDesc();

        descWrap.appendChild(descCell);
        row.appendChild(descWrap);
      }

      const exprSide = document.createElement('div');
      exprSide.className = 'formula-expr-side';

      const cell = document.createElement('div');
      cell.className = 'formula-cell';

      // The editable half of an input row, built below and inserted between the locked name
      // cell and the ` = ` separator.
      let inputValueCell: HTMLElement | null = null;

      if (isBodyOnly) {
        cell.style.display = 'none';
      } else if (inputId) {
        // --- Author-declared input row ------------------------------------------------------
        // The name is rendered, not edited: downstream formulas refer to it by name, so letting
        // it be retyped turns a working template into a sheet full of undefined variables with
        // no hint of what happened. Only the value is in the user's hands — and it always is,
        // whatever else about the block is locked, which is the point of declaring it an input.
        const { name, value } = splitInputRow(row.dataset.raw ?? '');
        cell.classList.add('formula-cell--locked');
        cell.title = 'Set by the template — only the value can be changed';
        const nameHtml = prettifyExpr(name);
        if (nameHtml) cell.innerHTML = nameHtml;
        else cell.textContent = name;

        const valueCell = document.createElement('div');
        inputValueCell = valueCell;
        valueCell.className = 'formula-input-value';
        // An input is editable even inside a sealed pack; only an explicit row lock stops it.
        valueCell.contentEditable = String(!rowDatum.lk);
        if (rowDatum.lk) {
          valueCell.classList.add('formula-cell--readonly');
          valueCell.title = lockNote;
        }
        valueCell.dataset.placeholder = rowDatum.uk
          ? `value [${rowDatum.uk.replace(/_/g, ' ')}]`
          : 'value';
        valueCell.textContent = value;

        const showProblem = (msg: string | null) => {
          valueCell.classList.toggle('formula-input-value--bad', !!msg);
          if (msg) valueCell.title = msg;
          else valueCell.removeAttribute('title');
        };
        showProblem(validateInputValue(value, rowDatum.uk));

        const commit = () => {
          const v = (valueCell.textContent ?? '').trim();
          showProblem(validateInputValue(v, rowDatum.uk));
          // Recorded against the id even when it fails to validate. Silently dropping a bad
          // entry loses the user's typing and leaves the previous number on screen looking
          // accepted; the row is marked instead, and evaluation reports it like any other row.
          (block.inputs ??= {})[inputId] = v;
          row.dataset.raw = `${name} = ${v}`;
          syncContent();
        };
        valueCell.addEventListener('focus', () => {
          lastFocusedRowIdx = i;
        });
        valueCell.addEventListener('input', commit);
        valueCell.addEventListener('blur', commit);
        valueCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Enter') ev.preventDefault();
        });
      } else {
        cell.contentEditable = 'true';
        // `for` headers (`i = 1 to n step 2`) stay plain text; if/elseif conditions render like any
        // expression so `x >= 0` shows as x ≥ 0.
        const PLAIN_TYPES = new Set(['for']);
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

        // A locked row renders exactly like any other — same fonts, same maths — and simply has
        // no way in. `contentEditable` false is the real barrier; the guards below matter because
        // `focus` replaces the rendered markup with raw source text as its first act, and a
        // non-editable div can still be focused programmatically.
        if (locked) {
          cell.contentEditable = 'false';
          cell.classList.add('formula-cell--readonly');
          cell.title = lockNote;
        }

        cell.addEventListener('focus', () => {
          if (locked) return;
          lastFocusedRowIdx = i;
          cell.textContent = row.dataset.raw ?? '';
          const range = document.createRange();
          range.selectNodeContents(cell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        cell.addEventListener('blur', () => {
          if (locked) return;
          row.dataset.raw = cell.textContent?.trim() ?? '';
          syncContent();
          renderMath();
        });
        cell.addEventListener('input', () => {
          if (locked) return;
          row.dataset.raw = cell.textContent ?? '';
          syncContent();
        });

        cell.addEventListener('keydown', (e: KeyboardEvent) => {
          // Ctrl+Enter / Ctrl+- add and remove rows. A locked row is not a place to do either.
          if (locked) return;
          const k = e.key;
          if (k === 'Enter' && e.altKey && !e.ctrlKey) {
            e.preventDefault();
            return;
          }
          if (!e.ctrlKey) return;
          if (
            k !== 'Enter' && k !== '-' && k.toLowerCase() !== 'z' &&
            k.toLowerCase() !== 'i' && k.toLowerCase() !== 'l' &&
            k.toLowerCase() !== 'e'
          ) return;
          e.preventDefault();
          e.stopPropagation();

          row.dataset.raw = cell.textContent?.trim() ?? '';
          const arr = parseFormulaRows(block.content);
          const allRows = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-row'));
          const idx = allRows.indexOf(row);

          const refocus = (targetIdx: number) => {
            rebuildRows();
            reEvalAllFormulas();
            const newCells = rowsEl.querySelectorAll<HTMLElement>(
              '.formula-cell:not([style*="display: none"])',
            );
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
            arr.splice(idx + 1, 0, { e: '', d: '', type: 'if' }, { e: '', d: '' }, {
              e: '',
              d: '',
              type: 'end',
            });
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const allCells = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-cell'));
            allCells[idx + 2]?.focus();
          } else if (k.toLowerCase() === 'l' && !e.altKey && !e.shiftKey) {
            arr.splice(idx + 1, 0, { e: 'i = 1 to n', d: '', type: 'for' }, { e: '', d: '' }, {
              e: '',
              d: '',
              type: 'end',
            });
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
              arr.splice(insertIdx, 0, { e: '', d: '', type: 'else' }, { e: '', d: '' });
            } else {
              arr.splice(insertIdx, 0, { e: '', d: '', type: 'elseif' }, { e: '', d: '' });
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
      if (inputValueCell) exprSide.appendChild(inputValueCell);
      exprSide.appendChild(sep);
      exprSide.appendChild(resultEl);
      row.appendChild(exprSide);

      const refWrap = document.createElement('div');
      refWrap.className = 'formula-ref-wrap';

      if (!isCtrl) {
        const refCell = document.createElement('div');
        refCell.contentEditable = String(!locked);
        refCell.className = 'formula-ref-cell';
        if (locked) {
          refCell.classList.add('formula-cell--readonly');
          refCell.title = lockNote;
        }
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
        refCell.addEventListener('input', () => {
          row.dataset.ref = serializeEditable(refCell);
        });
        refCell.addEventListener('blur', () => {
          row.dataset.ref = serializeEditable(refCell);
          if (row.dataset.ref) row.classList.add('has-ref');
          else row.classList.remove('has-ref');
          syncContent();
          updateHasAnyRef();
        });
        refCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && ev.shiftKey) {
            ev.preventDefault();
            (inputValueCell ?? cell).focus();
          }
          if (ev.key === 'Enter') {
            ev.preventDefault();
            insertLineBreak();
          }
        });

        refWrap.appendChild(refCell);
      }

      row.appendChild(refWrap);

      if (rowType === 'if' || rowType === 'for') {
        const group = document.createElement('div');
        group.className = 'formula-block-group';
        if (desc) group.classList.add('has-group-desc');
        if (ref) group.classList.add('has-group-ref');

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
        groupDescCell.addEventListener('input', () => {
          row.dataset.desc = serializeEditable(groupDescCell);
        });
        groupDescCell.addEventListener('blur', () => {
          row.dataset.desc = serializeEditable(groupDescCell);
          if (row.dataset.desc) {
            row.classList.add('has-desc');
            group.classList.add('has-group-desc');
          } else {
            row.classList.remove('has-desc');
            group.classList.remove('has-group-desc');
          }
          syncContent();
          updateHasAnyDesc();
          renderGroupDesc();
        });
        groupDescCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && !ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === 'Enter') {
            ev.preventDefault();
            insertLineBreak();
          }
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
        groupRefCell.addEventListener('input', () => {
          row.dataset.ref = serializeEditable(groupRefCell);
        });
        groupRefCell.addEventListener('blur', () => {
          row.dataset.ref = serializeEditable(groupRefCell);
          if (row.dataset.ref) {
            row.classList.add('has-ref');
            group.classList.add('has-group-ref');
          } else {
            row.classList.remove('has-ref');
            group.classList.remove('has-group-ref');
          }
          syncContent();
          updateHasAnyRef();
        });
        groupRefCell.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Tab' && ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === 'Enter') {
            ev.preventDefault();
            insertLineBreak();
          }
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

  // ── Alt+Arrow navigation between cells ──────────────────────────────────
  // Tab walks the cells but only forwards and backwards. Alt is the one free modifier: plain
  // arrows move the caret inside a cell and Shift+Arrow selects text (both needed for editing),
  // and Ctrl+Arrow already moves the whole block — deliberately, even while a cell has focus.
  // Alt+Left/Right is the browser's Back/Forward, so these must preventDefault; they only fire
  // when a formula cell has focus, leaving browser navigation alone everywhere else.
  const CELL_SEL = '.formula-desc-cell, .formula-cell, .formula-input-value, .formula-ref-cell';

  /**
   * A cell the user can actually reach — `else`/`end` rows hide their expression cell, and an
   * input row's name cell is rendered but not editable, so landing on it would strand the caret.
   */
  const isVisibleCell = (c: HTMLElement) =>
    c.style.display !== 'none' &&
    !c.classList.contains('formula-cell--locked') &&
    !c.classList.contains('formula-cell--readonly');

  const inDocOrder = (cells: HTMLElement[]): HTMLElement[] =>
    cells.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

  /**
   * The reachable cells belonging to one row, left to right. An if/for header row keeps its
   * description and reference on the surrounding group wrapper rather than on the row itself,
   * so those are collected too — otherwise Alt+Up/Down would skip them.
   */
  const cellsOfRow = (row: HTMLElement): HTMLElement[] => {
    const out = Array.from(row.querySelectorAll<HTMLElement>(CELL_SEL));
    const group = row.closest<HTMLElement>('.formula-block-group');
    if (group && group.querySelector('.formula-row') === row) {
      for (const child of Array.from(group.children)) {
        if (
          child.classList.contains('formula-desc-wrap') ||
          child.classList.contains('formula-ref-wrap')
        ) {
          out.push(...Array.from(child.querySelectorAll<HTMLElement>(CELL_SEL)));
        }
      }
    }
    return inDocOrder(out.filter(isVisibleCell));
  };

  /** Which column a cell sits in, so Alt+Up/Down can land in the same one. */
  const columnOf = (c: HTMLElement): string =>
    c.classList.contains('formula-desc-cell')
      ? 'formula-desc-cell'
      : c.classList.contains('formula-ref-cell')
      ? 'formula-ref-cell'
      : 'formula-cell';

  rowsEl.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (!ev.altKey || ev.ctrlKey || ev.shiftKey || ev.metaKey) return;
    const k = ev.key;
    if (k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'ArrowLeft' && k !== 'ArrowRight') return;
    const cur = (ev.target as HTMLElement).closest<HTMLElement>(CELL_SEL);
    if (!cur) return;

    let target: HTMLElement | undefined;

    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      // Across columns, continuing into the neighbouring row at either end — like Tab.
      const all = inDocOrder(
        Array.from(rowsEl.querySelectorAll<HTMLElement>(CELL_SEL)).filter(isVisibleCell),
      );
      target = all[all.indexOf(cur) + (k === 'ArrowRight' ? 1 : -1)];
    } else {
      const rows = Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-row'));
      const row = cur.closest<HTMLElement>('.formula-row') ??
        cur.closest<HTMLElement>('.formula-block-group')?.querySelector<HTMLElement>(
          '.formula-row',
        );
      const nextRow = rows[rows.indexOf(row!) + (k === 'ArrowDown' ? 1 : -1)];
      if (nextRow) {
        const cells = cellsOfRow(nextRow);
        // Same column when that row has one, otherwise its expression cell.
        target = cells.find((c) => columnOf(c) === columnOf(cur)) ??
          cells.find((c) => columnOf(c) === 'formula-cell') ?? cells[0];
      }
    }

    // Swallow the key either way: a no-op at the edge must not trigger browser Back/Forward.
    ev.preventDefault();
    ev.stopPropagation();
    target?.focus();
  });

  // ── Context menu action callbacks stored on rowsEl ──────────────────────
  const getRowIdx = (rowEl: HTMLElement): number =>
    Array.from(rowsEl.querySelectorAll<HTMLElement>('.formula-row')).indexOf(rowEl);

  const ctxRefocus = (idx: number) => {
    rebuildRows();
    reEvalAllFormulas();
    const cells = rowsEl.querySelectorAll<HTMLElement>(
      '.formula-cell:not([style*="display: none"])',
    );
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

    /** This row's line spacing; 1 (single) when it has never been set. */
    getRowSpacing: (rowEl: HTMLElement | null): number => {
      if (!rowEl) return 1;
      const arr = parseFormulaRows(block.content);
      return arr[getRowIdx(rowEl)]?.sp ?? 1;
    },

    /** Set this row's line spacing, independently of every other row. */
    setRowSpacing: (rowEl: HTMLElement | null, sp: number) => {
      if (!rowEl) return;
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      if (idx < 0 || !arr[idx]) return;
      if (sp > 1) arr[idx].sp = sp;
      else delete arr[idx].sp; // single is the default — storing a redundant 1 helps nobody
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
    },

    /** Whether this row is an author-declared input, and whether it could become one. */
    getRowInput: (
      rowEl: HTMLElement | null,
    ): { isInput: boolean; id: string; uk: string; canBe: boolean } => {
      const none = { isInput: false, id: '', uk: '', canBe: false };
      if (!rowEl) return none;
      const arr = parseFormulaRows(block.content);
      const r = arr[getRowIdx(rowEl)];
      if (!r) return none;
      // Control rows take a condition or a loop header, not a value, and a row with no name on
      // the left of the `=` has nothing for downstream formulas to refer to.
      const canBe = !r.type && !!splitInputRow(r.e).name && !inPurchasedPack();
      return { isInput: !!r.in, id: r.in ?? '', uk: r.uk ?? '', canBe };
    },

    /**
     * Declare this row an input, or take the declaration away.
     *
     * The id is seeded from the variable name because that is what an author expects to see,
     * but the two are independent from that moment on: renaming the variable later must NOT
     * move the id, or every value saved against it is orphaned. The unit kind is seeded from
     * whatever unit the row already carries.
     */
    setRowInput: (rowEl: HTMLElement | null, on: boolean) => {
      if (!rowEl) return;
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      const r = arr[idx];
      if (!r) return;
      if (!on) {
        // The stored value goes with the declaration. Leaving it in block.inputs would let a
        // stale number silently reappear if the row were ever made an input again.
        if (r.in) delete block.inputs?.[r.in];
        delete r.in;
        delete r.uk;
      } else {
        const { name, value } = splitInputRow(r.e);
        if (!name) return;
        const taken = new Set(arr.map((x) => x.in).filter(Boolean));
        let id = name;
        for (let n = 2; taken.has(id); n++) id = `${name}_${n}`;
        r.in = id;
        const kind = inputUnitKindOf(value);
        if (kind) r.uk = kind;
        (block.inputs ??= {})[id] = value;
      }
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
    },

    /** Set (or clear, with '') the unit kind an input row requires. */
    setRowInputKind: (rowEl: HTMLElement | null, uk: string) => {
      if (!rowEl) return;
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      if (!arr[idx]?.in) return;
      if (uk) arr[idx].uk = uk;
      else delete arr[idx].uk;
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
    },

    /**
     * Whether this row is locked, and whether the user is allowed to change that.
     *
     * A row inside a purchased pack is locked by the pack, not by the row, so the menu offers
     * nothing to toggle — unlocking it would be a promise the serializer does not keep, since
     * the edit would be dropped on save regardless.
     */
    getRowLock: (rowEl: HTMLElement | null): { locked: boolean; fixed: boolean } => {
      if (!rowEl) return { locked: false, fixed: true };
      const arr = parseFormulaRows(block.content);
      const r = arr[getRowIdx(rowEl)];
      if (!r) return { locked: false, fixed: true };
      const byPack = inPurchasedPack() && !r.in;
      return { locked: byPack || !!r.lk, fixed: byPack };
    },

    /** Lock or unlock a single row. Accident protection only — see FormulaRow.lk. */
    setRowLock: (rowEl: HTMLElement | null, lk: boolean) => {
      if (!rowEl) return;
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      if (idx < 0 || !arr[idx]) return;
      if (lk) arr[idx].lk = true;
      else delete arr[idx].lk; // unlocked is the default and is never stored
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
    },

    /** Lock or unlock every row at once — the block-level control. */
    setAllRowLocks: (lk: boolean) => {
      if (inPurchasedPack()) return;
      const arr = parseFormulaRows(block.content);
      for (const r of arr) {
        if (lk) r.lk = true;
        else delete r.lk;
      }
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
    },

    /** This row's display precision, or SIG_DEFAULT when it has never been set. */
    getRowSigDigits: (rowEl: HTMLElement | null): number => {
      if (!rowEl) return SIG_DEFAULT;
      const arr = parseFormulaRows(block.content);
      return arr[getRowIdx(rowEl)]?.sd ?? SIG_DEFAULT;
    },

    /** Set this row's display precision. Display only — the stored value is never rounded. */
    setRowSigDigits: (rowEl: HTMLElement | null, sd: number) => {
      if (!rowEl) return;
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      if (idx < 0 || !arr[idx]) return;
      if (sd !== SIG_DEFAULT) arr[idx].sd = sd;
      else delete arr[idx].sd; // the default is never stored
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
    },

    /** The precision every row shares, or 0 when they differ. */
    getUniformSigDigits: (): number => {
      const arr = parseFormulaRows(block.content);
      if (arr.length === 0) return SIG_DEFAULT;
      const first = arr[0].sd ?? SIG_DEFAULT;
      return arr.every((r) => (r.sd ?? SIG_DEFAULT) === first) ? first : 0;
    },

    /** The block-level control: overwrite EVERY row's precision. */
    setAllRowSigDigits: (sd: number) => {
      const arr = parseFormulaRows(block.content);
      for (const r of arr) {
        if (sd !== SIG_DEFAULT) r.sd = sd;
        else delete r.sd;
      }
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
    },

    /** The spacing every row shares, or 0 when they differ — so the menu can show "mixed". */
    getUniformSpacing: (): number => {
      const arr = parseFormulaRows(block.content);
      if (arr.length === 0) return 1;
      const first = arr[0].sp ?? 1;
      return arr.every((r) => (r.sp ?? 1) === first) ? first : 0;
    },

    /** The block-level control: overwrite EVERY row's spacing with this value. */
    setAllRowSpacing: (sp: number) => {
      const arr = parseFormulaRows(block.content);
      for (const r of arr) {
        if (sp > 1) r.sp = sp;
        else delete r.sp;
      }
      block.content = JSON.stringify(arr);
      rebuildRows();
      reEvalAllFormulas();
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
      arr.splice(idx + 1, 0, { e: '', d: '', type: 'if' }, { e: '', d: '' }, {
        e: '',
        d: '',
        type: 'end',
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 2);
    },

    insertForAfter: (rowEl: HTMLElement | null) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, { e: 'i = 1 to n', d: '', type: 'for' }, { e: '', d: '' }, {
        e: '',
        d: '',
        type: 'end',
      });
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
      arr.splice(insertIdx, 0, { e: '', d: '', type: 'elseif' }, { e: '', d: '' });
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
      arr.splice(insertIdx, 0, { e: '', d: '', type: 'else' }, { e: '', d: '' });
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
        descCell =
          group?.querySelector<HTMLElement>(':scope > .formula-desc-wrap .formula-desc-cell') ??
            null;
        if (descCell) {
          rowEl.classList.add('has-desc');
          group?.classList.add('has-group-desc');
          rowsEl.classList.add('has-any-desc');
          rowsEl.classList.add('has-any-row-desc');
        }
      } else {
        descCell = rowEl.querySelector<HTMLElement>('.formula-desc-cell');
        if (descCell) {
          rowEl.classList.add('has-desc');
          rowsEl.classList.add('has-any-row-desc');
          rowsEl.classList.add('has-any-desc');
        }
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
        refCell =
          group?.querySelector<HTMLElement>(':scope > .formula-ref-wrap .formula-ref-cell') ?? null;
        if (refCell) {
          rowEl.classList.add('has-ref');
          group?.classList.add('has-group-ref');
          rowsEl.classList.add('has-any-ref');
          rowsEl.classList.add('has-any-row-ref');
        }
      } else {
        refCell = rowEl.querySelector<HTMLElement>('.formula-ref-cell');
        if (refCell) {
          rowEl.classList.add('has-ref');
          rowsEl.classList.add('has-any-row-ref');
          rowsEl.classList.add('has-any-ref');
        }
      }
      if (!refCell) return;
      refCell.focus();
    },

    hasReference: (rowEl: HTMLElement | null) => !!rowEl?.classList.contains('has-ref'),
  };

  rebuildRows();

  // ── Right-edge resize handle ─────────────────────────────────────────────
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'formula-resize-handle';
  resizeHandle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    e.preventDefault();
    resizeHandle.setPointerCapture(e.pointerId);
    resizeHandle.classList.add('handle-active');
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const blockLeft = parseInt(el.style.left);
    const maxW = CANVAS_W - margins.right - blockLeft;
    const onMove = (mv: PointerEvent) => {
      const newW = Math.min(Math.max(220, startW + (mv.clientX - startX)), maxW);
      el.style.width = `${newW}px`;
      block.w = newW;
    };
    const onUp = () => {
      resizeHandle.removeEventListener('pointermove', onMove);
      resizeHandle.removeEventListener('pointerup', onUp);
      resizeHandle.removeEventListener('pointercancel', onUp);
      resizeHandle.classList.remove('handle-active');
      document.body.style.cursor = '';
    };
    resizeHandle.addEventListener('pointermove', onMove);
    resizeHandle.addEventListener('pointerup', onUp);
    resizeHandle.addEventListener('pointercancel', onUp);
    document.body.style.cursor = 'ew-resize';
  });
  el.appendChild(resizeHandle);
}
