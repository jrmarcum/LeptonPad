// ---------------------------------------------------------------------------
// Section block — collapsible container with scoped variable namespace
// ---------------------------------------------------------------------------

import { evalExpr as _evalExpr } from '../expr.ts';
import { formatUnit } from '../expr.ts';
import { type Block, GRID_SIZE } from '../types.ts';
import {
  state, canvas, CANVAS_W, CANVAS_H, margins,
  globalScope,
  sectionSummaryVarNames, sectionSummaryComparisons,
  childToSection, selectedEls, setMultiDragState,
  onSelectBlock, onMoveGridCursor,
} from '../state.ts';
import { clamp } from '../utils/units.ts';
import { fmtNum } from './formula.ts';
import { reEvalAllFormulas } from './formula.ts';

// ---------------------------------------------------------------------------
// Section layout helpers
// ---------------------------------------------------------------------------

/** Shift all top-level (non-child) blocks — including other sections — whose
 *  top edge is at or below prevBottom by deltaY pixels.  Called whenever a
 *  section's rendered height changes so content below doesn't overlap. */
export function shiftBlocksBelowSection(sectionEl: HTMLElement, prevBottom: number, deltaY: number) {
  if (!canvas || Math.abs(deltaY) < 1) return;
  for (const block of state.blocks) {
    if (block.id === sectionEl.id) continue;     // don't move the section itself
    if (childToSection.has(block.id)) continue;  // don't move blocks inside sections
    const blockEl = canvas.domElement.querySelector<HTMLElement>(`#${block.id}`);
    if (!blockEl) continue;
    const blockTop = parseInt(blockEl.style.top || '0');
    if (blockTop >= prevBottom - 2) {
      const newTop = Math.max(margins.top, blockTop + deltaY);
      blockEl.style.top = `${newTop}px`;
      block.y = newTop - margins.top;
    }
  }
}

/** Grow the section content area to fit its absolutely-positioned children.
 *  Synchronous: forces a layout read after setting minHeight so the delta
 *  is measured immediately and blocks below are shifted in the same frame. */
export function refreshSectionHeight(sectionEl: HTMLElement) {
  const content = sectionEl.querySelector<HTMLElement>('.section-content');
  // Skip while collapsed — ResizeObserver firing during hide/show would
  // corrupt content.style.minHeight and break collapse/expand symmetry.
  if (!content || content.classList.contains('collapsed')) return;

  // Capture height before any change (forces layout if needed)
  const prevTop = parseInt(sectionEl.style.top || '0');
  const prevH   = sectionEl.offsetHeight;

  let maxBottom = 60;
  content.querySelectorAll<HTMLElement>('.block').forEach((child) => {
    const b = parseInt(child.style.top || '0') + child.offsetHeight + GRID_SIZE;
    if (b > maxBottom) maxBottom = b;
  });

  const block = state.blocks.find((blk) => blk.id === sectionEl.id);
  const headerH = (sectionEl.querySelector<HTMLElement>('.section-header')?.offsetHeight  ?? GRID_SIZE)
                + (sectionEl.querySelector<HTMLElement>('.section-summary')?.offsetHeight  ?? GRID_SIZE)
                + (sectionEl.querySelector<HTMLElement>('.section-resize-handle')?.offsetHeight ?? 8);
  if (block?.h) {
    const contentCapacity = block.h - headerH - 2; // content area inside border-box height
    if (maxBottom > contentCapacity) {
      // Children outgrow the resize height — release the explicit constraint so
      // the section can auto-grow.  Keep block.h so resize handle still works.
      sectionEl.style.height = '';
    } else {
      // Children fit — enforce the user's resize minimum
      maxBottom = Math.max(maxBottom, contentCapacity);
    }
  }

  content.style.minHeight = `${maxBottom}px`;

  // Reading offsetHeight after setting minHeight forces a synchronous reflow,
  // giving us the true new height in the same call stack.
  const newH   = sectionEl.offsetHeight;
  const deltaY = newH - prevH;
  if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(sectionEl, prevTop + prevH, deltaY);
}

/** Refresh heights of every section on the canvas. */
export function refreshAllSectionHeights() {
  canvas.domElement.querySelectorAll<HTMLElement>('.section-block').forEach(refreshSectionHeight);
}

/** Re-render the always-visible summary line — driven only by Summary Blocks inside the section. */
export function updateSectionSummary(sectionEl: HTMLElement, block: Block) {
  const summary = sectionEl.querySelector<HTMLElement>('.section-summary');
  if (!summary) return;
  const prefix = (block.sectionName || 'section') + '__';

  const summaryVars = sectionSummaryVarNames.get(sectionEl.id);
  const entries = summaryVars && summaryVars.size > 0
    ? [...summaryVars].map((k) => {
        const v = globalScope[prefix + k] ?? globalScope[k];
        if (!v) return null;
        const unit = formatUnit(v.u);
        return `${k} = ${fmtNum(v.v)}${unit ? ' ' + unit : ''}`;
      }).filter(Boolean) as string[]
    : [];

  const comparisons = sectionSummaryComparisons.get(sectionEl.id) ?? [];

  if (entries.length === 0 && comparisons.length === 0) {
    summary.innerHTML = '<span class="section-summary-empty">no outputs yet</span>';
    return;
  }
  summary.innerHTML = '';
  if (entries.length > 0) {
    const varsSpan = document.createElement('span');
    varsSpan.textContent = entries.join('\u00a0\u00a0|\u00a0\u00a0');
    summary.appendChild(varsSpan);
  }
  for (const cmp of comparisons) {
    if (entries.length > 0 || summary.childElementCount > 0) {
      summary.appendChild(document.createTextNode('\u00a0\u00a0|\u00a0\u00a0'));
    }
    const badge = document.createElement('span');
    badge.className = cmp.pass ? 'section-cmp-pass' : 'section-cmp-fail';
    badge.textContent = (cmp.pass ? '✓ ' : '✗ ') + cmp.expr;
    summary.appendChild(badge);
  }
}

// ---------------------------------------------------------------------------
// Section parenting helpers
// ---------------------------------------------------------------------------

/** Reparent a block element into a section's content area. */
export function reparentToSection(childEl: HTMLElement, sectionEl: HTMLElement) {
  const content = sectionEl.querySelector<HTMLElement>('.section-content');
  if (!content) return;
  const sectionBlock = state.blocks.find((b) => b.id === sectionEl.id);
  const childBlock   = state.blocks.find((b) => b.id === childEl.id);
  if (!sectionBlock || !childBlock) return;

  // Convert canvas-absolute coords to section-content-relative coords
  const contentRect = content.getBoundingClientRect();
  const childRect   = childEl.getBoundingClientRect();
  const relLeft = Math.max(0, Math.round((childRect.left - contentRect.left) / GRID_SIZE) * GRID_SIZE);
  const relTop  = Math.max(0, Math.round((childRect.top  - contentRect.top)  / GRID_SIZE) * GRID_SIZE);

  content.appendChild(childEl);
  childEl.style.left = `${relLeft}px`;
  childEl.style.top  = `${relTop}px`;
  childEl.style.maxWidth = '';

  childBlock.x = relLeft;
  childBlock.y = relTop;
  childBlock.parentSectionId = sectionBlock.id;
  childToSection.set(childBlock.id, sectionBlock.id);

  refreshSectionHeight(sectionEl);
}

/** Move a child block back onto the canvas as a top-level block. */
export function unparentFromSection(childEl: HTMLElement, sectionEl: HTMLElement) {
  const content = sectionEl.querySelector<HTMLElement>('.section-content');
  if (!content) return;
  const childBlock = state.blocks.find((b) => b.id === childEl.id);
  if (!childBlock) return;

  // Convert section-relative coords back to canvas-absolute
  const contentRect  = content.getBoundingClientRect();
  const canvasRect   = canvas.domElement.getBoundingClientRect();
  const absLeft = clamp(
    Math.round((contentRect.left - canvasRect.left + childBlock.x) / GRID_SIZE) * GRID_SIZE,
    margins.left, CANVAS_W - margins.right,
  );
  const absTop = clamp(
    Math.round((contentRect.top - canvasRect.top + childBlock.y) / GRID_SIZE) * GRID_SIZE,
    margins.top, CANVAS_H,
  );

  canvas.domElement.appendChild(childEl);
  childEl.style.left = `${absLeft}px`;
  childEl.style.top  = `${absTop}px`;
  childEl.style.maxWidth = `${CANVAS_W - margins.right - absLeft}px`;

  childBlock.x = absLeft - margins.left;
  childBlock.y = absTop  - margins.top;
  delete childBlock.parentSectionId;
  childToSection.delete(childBlock.id);

  refreshSectionHeight(sectionEl);
}

/** Return the open section element (if any) whose content area contains canvas point (cx, cy).
 *  Uses style.left/top + offsetTop so coords match gridCursor (pure canvas-relative, scroll-safe). */
export function sectionAtPoint(cx: number, cy: number): HTMLElement | null {
  for (const el of canvas.domElement.querySelectorAll<HTMLElement>('.section-block')) {
    const content = el.querySelector<HTMLElement>('.section-content');
    if (!content || content.classList.contains('collapsed')) continue;
    const elLeft    = parseInt(el.style.left || '0');
    const elTop     = parseInt(el.style.top  || '0');
    const contentTop = elTop + content.offsetTop;
    if (cx >= elLeft && cx <= elLeft + el.offsetWidth &&
        cy >= contentTop && cy <= contentTop + content.offsetHeight) return el;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Section naming helpers
// ---------------------------------------------------------------------------

const SECTION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
let _sectionColorIdx = 0;
export function nextSectionColor(): string {
  return SECTION_COLORS[_sectionColorIdx++ % SECTION_COLORS.length];
}

/** Return the next available auto-name: section1, section2, … */
export function nextSectionName(): string {
  const existing = new Set(
    state.blocks
      .filter(b => b.type === 'section' && b.sectionName)
      .map(b => b.sectionName!)
  );
  let i = 1;
  while (existing.has(`section${i}`)) i++;
  return `section${i}`;
}

/** Sanitize a raw string to a valid identifier (snake/camel/Pascal-safe). */
export function sanitizeSectionName(raw: string): string {
  return raw
    .trim()
    .replace(/[\s\-]+/g, '_')          // spaces/hyphens → underscore
    .replace(/[^A-Za-z0-9_]/g, '')     // strip remaining invalid chars
    .replace(/__+/g, '_')              // collapse double-underscore (namespace separator)
    .replace(/^[0-9_]+/, '')           // strip leading digits / underscores
    .replace(/_+$/, '');               // strip trailing underscores
}

// ---------------------------------------------------------------------------
// buildSectionBlock
// ---------------------------------------------------------------------------

export function buildSectionBlock(el: HTMLElement, block: Block) {
  const color = block.sectionColor ?? nextSectionColor();
  block.sectionColor = color;
  el.style.setProperty('--section-color', color);
  el.classList.add('section-block');

  // ── Header ──────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'section-header';

  const toggle = document.createElement('button');
  toggle.className = 'section-toggle';
  toggle.textContent = block.collapsed ? '▶' : '▼';
  toggle.title = 'Collapse / expand section';

  const title = document.createElement('span');
  title.className = 'section-title';
  title.contentEditable = 'true';
  title.textContent = block.sectionName ?? 'section1';
  title.dataset.placeholder = 'Section name…';
  title.addEventListener('mousedown', (ev) => {
    ev.stopPropagation(); // prevent header drag from starting
    // Let the browser handle focus/caret placement naturally
  });
  title.addEventListener('blur', () => {
    const candidate = sanitizeSectionName(title.textContent ?? '') || block.sectionName || nextSectionName();
    const isDuplicate = state.blocks.some(
      b => b.type === 'section' && b.id !== block.id && b.sectionName === candidate
    );
    if (isDuplicate) {
      // Flash the title red and revert to the current name
      title.style.color = '#ef4444';
      title.style.outline = '1px solid #ef4444';
      title.textContent = block.sectionName ?? candidate;
      setTimeout(() => { title.style.color = ''; title.style.outline = ''; }, 1500);
    } else {
      title.textContent = candidate;
      block.sectionName = candidate;
      reEvalAllFormulas();
    }
  });
  title.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); title.blur(); }
  });

  header.appendChild(toggle);
  header.appendChild(title);
  el.appendChild(header);

  // ── Summary (always visible) ─────────────────────────────────────────────
  const summary = document.createElement('div');
  summary.className = 'section-summary';
  summary.innerHTML = '<span class="section-summary-empty">no outputs yet</span>';
  el.appendChild(summary);

  // ── Content area (children live here) ───────────────────────────────────
  const content = document.createElement('div');
  content.className = 'section-content';
  if (block.collapsed) {
    content.classList.add('collapsed');
    el.style.minHeight = '0';
  }
  el.appendChild(content);

  // ── Collapse toggle ──────────────────────────────────────────────────────
  toggle.addEventListener('click', (ev) => {
    ev.stopPropagation();
    // Capture height BEFORE any change (forces synchronous layout)
    const prevBottom = parseInt(el.style.top || '0') + el.offsetHeight;
    block.collapsed = !block.collapsed;
    toggle.textContent = block.collapsed ? '▶' : '▼';
    content.classList.toggle('collapsed', block.collapsed);
    if (block.collapsed) {
      // Suppress min-height so the block shrinks to header+summary only
      el.style.height = '';
      el.style.minHeight = '0';
      resizeHandle.style.display = 'none';
    } else {
      el.style.minHeight = '';   // restore CSS default (80px)
      el.style.height    = '';   // let refreshSectionHeight auto-size from content
      resizeHandle.style.display = '';
      updateSectionSummary(el, block);
    }
    // Reading offsetHeight after style changes forces a synchronous reflow so
    // newBottom is the true post-toggle height in the same call stack — no rAF
    // timing race with ResizeObserver callbacks that could corrupt minHeight.
    const newBottom = parseInt(el.style.top || '0') + el.offsetHeight;
    const deltaY = newBottom - prevBottom;
    if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(el, prevBottom, deltaY);
  });

  // ── Pull-down resize handle ───────────────────────────────────────────────
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'section-resize-handle';
  if (block.collapsed) resizeHandle.style.display = 'none';
  el.appendChild(resizeHandle);

  resizeHandle.addEventListener('mousedown', (ev) => {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    ev.preventDefault();
    const startY      = ev.clientY;
    const startH      = el.offsetHeight;
    const startBottom = parseInt(el.style.top || '0') + startH;
    document.body.style.cursor = 'ns-resize';
    const onMove = (mv: MouseEvent) => {
      const newH = Math.max(80, startH + (mv.clientY - startY));
      block.h = newH;
      el.style.height = `${newH}px`;
      const headerH = (el.querySelector<HTMLElement>('.section-header')?.offsetHeight ?? GRID_SIZE)
                    + (el.querySelector<HTMLElement>('.section-summary')?.offsetHeight ?? GRID_SIZE)
                    + (el.querySelector<HTMLElement>('.section-resize-handle')?.offsetHeight ?? 8);
      // border-box: el.offsetHeight includes 2px borders, so content area = newH - 2 - headerH
      content.style.minHeight = `${Math.max(GRID_SIZE * 2, newH - headerH - 2)}px`;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      // Shift all blocks below by however much the section grew/shrank
      const newBottom = parseInt(el.style.top || '0') + el.offsetHeight;
      const deltaY = newBottom - startBottom;
      if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(el, startBottom, deltaY);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // ── Section content click → move grid cursor (bypass canvas block guard) ──
  content.addEventListener('click', (ev) => {
    if ((ev.target as HTMLElement).closest('.block:not(.section-block)')) return; // child block handled itself
    const canvasRect = canvas.domElement.getBoundingClientRect();
    onMoveGridCursor?.(ev.clientX - canvasRect.left, ev.clientY - canvasRect.top);
  });

  // ── Auto-resize: watch children added/removed AND each child's size changes ──
  const childResizeObserver = new ResizeObserver(() => refreshSectionHeight(el));
  const childMutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof HTMLElement && node.classList.contains('block')) {
          childResizeObserver.observe(node);
        }
      }
      for (const node of m.removedNodes) {
        if (node instanceof HTMLElement && node.classList.contains('block')) {
          childResizeObserver.unobserve(node);
        }
      }
    }
    refreshSectionHeight(el);
  });
  childMutationObserver.observe(content, { childList: true });

  // ── Drag: use header as handle; do NOT drag when clicking section title ──
  header.addEventListener('mousedown', (ev) => {
    if (ev.button !== 0) return;
    if ((ev.target as HTMLElement).isContentEditable) return;
    if ((ev.target as HTMLElement).tagName === 'BUTTON') return;
    ev.stopPropagation(); // prevent canvas rubber-band
    if (!selectedEls.has(el)) onSelectBlock?.(el);
    setMultiDragState({
      startX: ev.clientX,
      startY: ev.clientY,
      origPositions: new Map([...selectedEls].map((s) => [s, {
        left: parseInt(s.style.left),
        top: parseInt(s.style.top),
      }])),
    });
    document.body.style.cursor = 'grabbing';
    ev.preventDefault();
  });
}
