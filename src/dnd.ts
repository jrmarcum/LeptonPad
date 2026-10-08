// ---------------------------------------------------------------------------
// DnD — selection, deletion, cursor, page management, block placement, drop
// ---------------------------------------------------------------------------

import { type Block, GRID_SIZE, type TitleBlockData } from './types.ts';
import {
  canvas,
  CANVAS_H,
  CANVAS_W,
  childToSection,
  clipboardBlocks,
  customModules,
  deletionStack,
  firstGridLine,
  gridCursor,
  lastGridColumn,
  lastGridLine,
  margins,
  maxWidthFor,
  numPages,
  PAGE_H,
  pageIndexOf,
  pageNumberingEnabled,
  pageWorkArea,
  selectedEl,
  selectedEls,
  setCANVAS_H,
  setClipboardBlocks,
  setNumPages,
  setSelectedEl,
  setTitleBlockMeasuredH,
  snapToPageGrid,
  state,
  titleBlockEnabled,
  titleBlockH,
} from './state.ts';
import { clamp } from './utils/units.ts';
import { parseFormulaRows, reEvalAllFormulas, safeSplitIndex } from './blocks/formula.ts';
import { safeTextSplitLine } from './blocks/text.ts';
import { renderMarkdown } from './utils/markdown.ts';
import {
  nextSectionName,
  refreshSectionHeight,
  reparentToSection,
  sectionAtPoint,
  unparentFromSection,
} from './blocks/pro/section.ts';
import { nextFigureNum, renumberFigures } from './blocks/figure.ts';

// ---------------------------------------------------------------------------
// Cursor visibility
// ---------------------------------------------------------------------------

export function showCursor() {
  document.getElementById('grid-cursor')!.style.zIndex = '9999';
}
export function hideCursor() {
  document.getElementById('grid-cursor')!.style.zIndex = '-1';
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

export function selectBlock(el: HTMLElement) {
  for (const s of selectedEls) s.classList.remove('selected');
  selectedEls.clear();
  setSelectedEl(el);
  selectedEls.add(el);
  el.classList.add('selected');
  hideCursor();
}

export function addToSelection(el: HTMLElement) {
  if (selectedEls.has(el)) {
    el.classList.remove('selected');
    selectedEls.delete(el);
    if (selectedEl === el) setSelectedEl(selectedEls.size > 0 ? [...selectedEls].at(-1)! : null);
    if (selectedEls.size === 0) showCursor();
  } else {
    el.classList.add('selected');
    selectedEls.add(el);
    setSelectedEl(el);
    hideCursor();
  }
}

export function clearSelection() {
  for (const s of selectedEls) s.classList.remove('selected');
  selectedEls.clear();
  setSelectedEl(null);
  showCursor();
}

// ---------------------------------------------------------------------------
// Deletion
// ---------------------------------------------------------------------------

export function deleteBlock(el: HTMLElement) {
  const idx = state.blocks.findIndex((b) => b.id === el.id);
  if (idx !== -1) {
    const block = state.blocks[idx];
    deletionStack.push({ ...block }); // snapshot before removal

    if (block.type === 'section') {
      // Unparent all children back to canvas before removing the section
      const content = el.querySelector<HTMLElement>('.section-content');
      if (content) {
        for (const child of Array.from(content.querySelectorAll<HTMLElement>('.block'))) {
          const childBlock = state.blocks.find((b) => b.id === child.id);
          if (childBlock) {
            unparentFromSection(child, el);
          }
        }
      }
    } else if (block.parentSectionId) {
      // Remove child from parent section tracking
      childToSection.delete(block.id);
      delete block.parentSectionId;
    }

    state.blocks.splice(idx, 1);
  }
  el.remove();
  selectedEls.delete(el);
  if (selectedEl === el) {
    setSelectedEl(selectedEls.size > 0 ? [...selectedEls].at(-1)! : null);
    if (selectedEls.size === 0) showCursor();
  }
  reEvalAllFormulas();
  updatePageCount();
}

// ---------------------------------------------------------------------------
// Vertical block shifting
// ---------------------------------------------------------------------------

// Shift all blocks whose top edge is at or below thresholdY (canvas px) by delta px.
// Title blocks are pinned to the top of their page and must never move — they carry the `.block`
// class, so without this guard Shift+Enter pushed page 2+ title blocks down one grid square per
// press. Section children are positioned relative to their section and move with it.
export function shiftBlocksVertical(thresholdY: number, delta: number, exceptId?: string) {
  for (const el of canvas.domElement.querySelectorAll<HTMLElement>('.block')) {
    if (el.classList.contains('title-block') || childToSection.has(el.id)) continue;
    // `exceptId` is the block the space is being made FOR. It sits at the threshold, so without
    // this it would shift itself out of the gap it just created.
    if (exceptId && el.id === exceptId) continue;
    const top = parseInt(el.style.top);
    if (top >= thresholdY) {
      const newTop = clamp(top + delta, margins.top, CANVAS_H + PAGE_H);
      placeBlock(el, parseInt(el.style.left), newTop);
    }
  }
  updatePageCount();
}

// ---------------------------------------------------------------------------
// Page separators and title blocks
// ---------------------------------------------------------------------------

/** Create or destroy title block overlay elements — one per page. */
export function syncTitleBlocks() {
  canvas.domElement.querySelectorAll('.title-block-overlay').forEach((e) => e.remove());
  if (!titleBlockEnabled) return;
  if (!state.titleBlock) {
    state.titleBlock = {
      project: '',
      by: '',
      subject: '',
      subject2: '',
      subject3: '',
      date: '',
      jobNo: '',
    };
  }
  const w = CANVAS_W - margins.left - margins.right;
  for (let i = 0; i < numPages; i++) {
    const el = document.createElement('div');
    el.className = 'block title-block title-block-overlay';
    el.style.left = `${margins.left}px`;
    // page-origin-ok: the title block sits at the top of the page's content area, ABOVE the work
    // area — margins.top genuinely is its anchor, and the work area is defined as starting below it.
    el.style.top = `${i * PAGE_H + margins.top}px`;
    el.style.width = `${w}px`;
    el.style.maxWidth = '';
    el.style.zIndex = '2';
    buildTitleBlockOverlay(el, i);
    canvas.domElement.appendChild(el);
    // Editing the SUBJECT can rewrap it to another line, which changes every page's work area.
    // Observing is what makes that reflow while the user types, rather than at the next rebuild.
    // The observer dies with the element, and syncTitleBlocks recreates both together.
    if (i === 0) new ResizeObserver(() => refreshTitleBlockHeight()).observe(el);
  }
  refreshTitleBlockHeight();
}

/**
 * Measure the rendered title block and reflow the page if its height changed.
 *
 * The overlay grows with its content — a wrapped SUBJECT line is the common case — and every page
 * bound is derived from `titleBlockH()`, so the measurement has to reach it or blocks get placed
 * under the part of the title block nobody counted.
 *
 * Only the FIRST overlay is measured: every page's title block is built from the same data and the
 * same fixed width, so they render identically, and one measurement keeps every page's work area
 * the same height — which is what makes a continuation on page 3 line up with one on page 1.
 *
 * No recursion risk: this changes the position of OTHER elements, never the title block's own size,
 * so a ResizeObserver watching it cannot be re-triggered by the reflow.
 */
export function refreshTitleBlockHeight() {
  if (!titleBlockEnabled) return;
  const first = canvas.domElement.querySelector<HTMLElement>('.title-block-overlay');
  if (!first) return;
  if (!setTitleBlockMeasuredH(first.offsetHeight)) return;
  canvas.updateMarginGuide();
  updatePageCount();
}

/**
 * Reflect the page-numbering preference and the title block's suppression of it in the sidebar.
 *
 * ONE definition, because main.ts's title-block handler and persistence.ts's project load each
 * had their own copy — and both copies did the same wrong thing: they set the preference itself
 * to false when the title block came on, so toggling the title block off left Page Numbering
 * unchecked with no way to tell it had been changed for you. The checkbox now always shows the
 * preference; only `disabled` reflects the title block.
 */
export function syncPageNumberingToggle() {
  const cb = document.getElementById('page-numbering-toggle') as HTMLInputElement | null;
  if (!cb) return;
  cb.checked = pageNumberingEnabled;
  cb.disabled = titleBlockEnabled;
  const label = cb.parentElement as HTMLElement | null;
  if (label) {
    label.style.opacity = titleBlockEnabled ? '0.4' : '1';
    label.style.pointerEvents = titleBlockEnabled ? 'none' : '';
  }
}

// Rebuild page-separator bars and per-page margin guides to match numPages.
export function syncPageSeparators() {
  canvas.domElement.querySelectorAll('.page-sep, .page-guide, .page-num').forEach((e) =>
    e.remove()
  );
  const isGridOn = document.getElementById('margin-guide')!.classList.contains('engineering-grid');
  for (let i = 1; i < numPages; i++) {
    // Per-page margin guide
    const guide = document.createElement('div');
    guide.className = 'page-guide';
    if (isGridOn) guide.classList.add('engineering-grid');
    canvas.domElement.appendChild(guide);
    // Visual separator bar
    const sep = document.createElement('div');
    sep.className = 'page-sep';
    sep.style.top = `${i * PAGE_H}px`;
    const label = document.createElement('span');
    label.textContent = `Page ${i + 1}`;
    sep.appendChild(label);
    canvas.domElement.appendChild(sep);
  }
  // Page number labels — one per page, bottom-right, print-only.
  //
  // TWO independent conditions, and this used to test only the second: the checkbox had no
  // effect at all, because `pageNumberingEnabled` was never read here. Unchecking Page Numbering
  // appeared to do nothing while the title block was off.
  //   • pageNumberingEnabled — the user's preference.
  //   • titleBlockEnabled    — suppression, because the title block carries its own sheet number.
  // The title block must suppress the DISPLAY without overwriting the preference, or turning it
  // on and off again silently loses the user's setting.
  if (pageNumberingEnabled && !titleBlockEnabled) {
    for (let i = 1; i <= numPages; i++) {
      const pn = document.createElement('div');
      pn.className = 'page-num';
      pn.textContent = `Page ${i} of ${numPages}`;
      pn.style.top = `${i * PAGE_H - margins.bottom}px`;
      pn.style.right = `${margins.right}px`;
      canvas.domElement.appendChild(pn);
    }
  }
  canvas.updateMarginGuide();
  syncTitleBlocks();
}

// Grow or shrink the canvas to exactly the number of pages required to fit all blocks.
export function updatePageCount() {
  const blockEls = canvas.domElement.querySelectorAll<HTMLElement>('.block');
  let maxBottom = 0;
  for (const el of blockEls) {
    if (childToSection.has(el.id)) continue; // child blocks don't drive canvas height
    // ⚠️ The INTENDED top, not only the rendered one. `repositionBlocks` clamps the rendered top to
    // `CANVAS_H - el.offsetHeight`, so reading `el.style.top` alone measured a position that had
    // ALREADY been pulled up to fit the current canvas — and the page count computed from it then
    // never grew, which is exactly what kept it pulled up. A block therefore could not be moved
    // past the end of the document: Shift+Enter looked ignored, and a figure dropped low landed
    // somewhere other than the cursor (Jon, 2026-10-07). The clamp also does not write back, so
    // `block.y` and the rendered top silently disagreed for as long as it held.
    const b = state.blocks.find((bl) => bl.id === el.id);
    const intendedTop = b ? margins.top + (b.type === 'section' ? titleBlockH() : 0) + b.y : NaN;
    const top = Math.max(
      parseInt(el.style.top) || 0,
      Number.isFinite(intendedTop) ? intendedTop : 0,
    );
    const bot = top + el.offsetHeight;
    if (bot > maxBottom) maxBottom = bot;
  }
  // Before the early return below, which is the common case — a block that laps over a page
  // break usually does so without changing the page COUNT at all, so marking it after that
  // return would mean the marker only ever appeared when a page was added or removed.
  markPageOverflow();
  // Same reasoning, and the same placement in the function: figure numbers follow document order,
  // so every geometry change can change them, and the page COUNT usually does not change at all.
  renumberFigures();

  // Trigger a new page when block bottom + bottom margin would overflow the current last page
  const needed = Math.max(1, Math.ceil((maxBottom + margins.bottom) / PAGE_H));
  if (needed === numPages) return;
  setNumPages(needed);
  setCANVAS_H(numPages * PAGE_H);
  canvas.domElement.style.height = `${CANVAS_H}px`;
  syncPageSeparators();
}

// ---------------------------------------------------------------------------
// Title block overlay builder
// ---------------------------------------------------------------------------

export function buildTitleBlockOverlay(el: HTMLElement, pageIdx = 0) {
  el.innerHTML = '';
  el.classList.add('title-block', 'title-block-overlay');
  el.style.padding = '0';
  el.style.cursor = 'default';
  el.style.zIndex = '2';

  const data = state.titleBlock ??
    {
      project: '',
      by: '',
      subject: '',
      subject2: '',
      subject3: '',
      date: '',
      jobNo: '',
    };
  if (!state.titleBlock) state.titleBlock = data;

  function save() {
    // Sync the changed field value to all other overlays
    canvas.domElement.querySelectorAll<HTMLElement>('.title-block-overlay').forEach((other) => {
      if (other === el) return;
      other.querySelectorAll<HTMLElement>('[data-tb-field]').forEach((cell) => {
        const f = cell.dataset.tbField as keyof TitleBlockData;
        if (!cell.contains(document.activeElement)) {
          cell.textContent = (data as unknown as Record<string, string>)[f] ?? '';
        }
      });
    });
  }

  const table = document.createElement('table');
  table.className = 'title-block-table';

  function makeLabel(text: string): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = 'tb-label';
    td.textContent = text;
    return td;
  }

  function makeValue(key: keyof TitleBlockData, cls = ''): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = `tb-value${cls ? ' ' + cls : ''}`;
    td.dataset.tbField = key;
    td.contentEditable = 'true';
    td.textContent = (data[key] as string) ?? '';
    td.addEventListener('mousedown', (ev) => ev.stopPropagation());
    td.addEventListener('blur', () => {
      (data as unknown as Record<string, string>)[key] = td.textContent ?? '';
      save();
    });
    td.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        td.blur();
      }
    });
    return td;
  }

  const logoTd = document.createElement('td');
  logoTd.className = 'tb-logo';
  logoTd.rowSpan = 4;

  const logoImg = document.createElement('img');
  logoImg.className = 'tb-logo-img';
  if (data.logo) {
    logoImg.src = data.logo;
    logoImg.style.display = '';
  } else logoImg.style.display = 'none';

  const logoPh = document.createElement('div');
  logoPh.className = 'tb-logo-ph';
  logoPh.textContent = '+ Logo';
  if (data.logo) logoPh.style.display = 'none';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/png,image/jpeg';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      data.logo = url;
      canvas.domElement.querySelectorAll<HTMLElement>('.title-block-overlay').forEach((o) => {
        const img = o.querySelector<HTMLImageElement>('.tb-logo-img');
        const ph = o.querySelector<HTMLElement>('.tb-logo-ph');
        if (img) {
          img.src = url;
          img.style.display = '';
        }
        if (ph) ph.style.display = 'none';
      });
    };
    reader.readAsDataURL(file);
  });

  logoTd.appendChild(logoImg);
  logoTd.appendChild(logoPh);
  logoTd.appendChild(fileInput);
  logoTd.addEventListener('click', (ev) => {
    ev.stopPropagation();
    fileInput.click();
  });
  logoTd.addEventListener('mousedown', (ev) => ev.stopPropagation());

  const lbProject = makeLabel('Project');
  lbProject.style.width = '68px';
  const lbBy = makeLabel('By');
  lbBy.style.width = '68px';
  const lbSheetNo = makeLabel('Sheet No.');
  lbSheetNo.style.width = '68px';
  const ROW_H = '28px';
  const row1 = document.createElement('tr');
  row1.style.height = ROW_H;
  row1.appendChild(logoTd);
  row1.appendChild(lbProject);
  row1.appendChild(makeValue('project', 'tb-wide'));
  row1.appendChild(lbBy);
  row1.appendChild(lbSheetNo);
  table.appendChild(row1);

  const sheetNoTd = document.createElement('td');
  sheetNoTd.className = 'tb-value tb-narrow tb-sheet-num';
  sheetNoTd.textContent = `${pageIdx + 1} of ${numPages}`;
  const row2 = document.createElement('tr');
  row2.style.height = ROW_H;
  row2.appendChild(makeLabel('Subject'));
  row2.appendChild(makeValue('subject', 'tb-wide'));
  row2.appendChild(makeValue('by'));
  row2.appendChild(sheetNoTd);
  table.appendChild(row2);

  const row3 = document.createElement('tr');
  row3.style.height = ROW_H;
  const blank3 = document.createElement('td');
  blank3.className = 'tb-blank';
  row3.appendChild(blank3);
  row3.appendChild(makeValue('subject2', 'tb-wide'));
  row3.appendChild(makeLabel('Date'));
  row3.appendChild(makeLabel('Job No.'));
  table.appendChild(row3);

  const row4 = document.createElement('tr');
  row4.style.height = ROW_H;
  const blank4 = document.createElement('td');
  blank4.className = 'tb-blank';
  row4.appendChild(blank4);
  row4.appendChild(makeValue('subject3', 'tb-wide'));
  row4.appendChild(makeValue('date'));
  row4.appendChild(makeValue('jobNo', 'tb-narrow'));
  table.appendChild(row4);

  el.appendChild(table);
}

// ---------------------------------------------------------------------------
// Block placement helpers
// ---------------------------------------------------------------------------

export function placeBlock(el: HTMLElement, newLeft: number, newTop: number) {
  const b = state.blocks.find((blk) => blk.id === el.id);
  // A drag had no title-block guard at all — only the keyboard grid cursor did — so a block could
  // be dropped straight onto a title block and disappear behind it (z-index 2). Clamped here so
  // every placement path shares the rule, and the STORED y is the clamped one: a position that is
  // only corrected for display diverges from the data and reappears wrong on the next open.
  // Snapped, not merely floored. A drag arrives with a raw pointer delta, and the stored y is what
  // every later reposition replays — so an unsnapped drop is an off-grid position forever. Using
  // the same function as addBlock and updateMarginGuide is the point: three paths, one rule.
  newTop = snapToPageGrid(newTop);
  newLeft = margins.left + Math.round((newLeft - margins.left) / GRID_SIZE) * GRID_SIZE;
  if (b?.type === 'section') {
    el.style.left = `${margins.left}px`;
    el.style.top = `${newTop}px`;
    el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
    el.style.maxWidth = '';
    b.x = 0;
    b.y = newTop - margins.top - titleBlockH();
    return;
  }
  el.style.left = `${newLeft}px`;
  el.style.top = `${newTop}px`;
  el.style.maxWidth = maxWidthFor(b, newLeft);
  if (b) {
    b.x = newLeft - margins.left;
    b.y = newTop - margins.top;
  }
}

export function blocksOverlap(a: HTMLElement, b: HTMLElement): boolean {
  const aL = parseInt(a.style.left), aT = parseInt(a.style.top);
  const aR = aL + a.offsetWidth, aB = aT + a.offsetHeight;
  const bL = parseInt(b.style.left), bT = parseInt(b.style.top);
  const bR = bL + b.offsetWidth, bB = bT + b.offsetHeight;
  return aR > bL && aL < bR && aB > bT && aT < bB;
}

/** A figure is placed deliberately, so it is never reflowed — see `resolveOverlapsRight`. */
function isFigure(el: HTMLElement): boolean {
  return el.classList.contains('figure-block');
}

// When moving a block right, cascade-push any block it collides with.
//
// ⚠️ **Figures are exempt, in both roles** (Jon, 2026-10-07). This function is auto-layout: when a
// block has no room to its right it WRAPS to the left margin and shoves everything below down by
// `bH + GRID_SIZE`. That is reasonable for flowing formula rows and completely wrong for a figure,
// which the user positions on purpose. It produced all three reports:
//
//   - "the placement will not let a figure block land to the right of a previous figure block"
//     — the wrap sends it back to `margins.left` instead of leaving it beside its neighbour;
//   - "it shifts it down two figure block heights" — `otherTop + bH + GRID_SIZE`, once per pass;
//   - "it won't unlock so that it can move above another figure block" — a figure that overlaps
//     another gets relocated rather than allowed to sit there.
//
// Overlap between figures is now simply allowed. "There shouldn't be any spacing at all. Just
// place at this point picked."
export function resolveOverlapsRight(movedEl: HTMLElement) {
  if (movedEl.classList.contains('title-block') || movedEl.classList.contains('section-block')) {
    return;
  }
  // As the MOVED block: a figure dragged right never triggers a reflow of anything.
  if (isFigure(movedEl)) return;

  const movedLeft = parseInt(movedEl.style.left);
  const movedTop = parseInt(movedEl.style.top);
  const movedBottom = movedTop + movedEl.offsetHeight;

  const wrapY = margins.top + Math.ceil((movedBottom - margins.top) / GRID_SIZE) * GRID_SIZE;

  function inRegion(el: HTMLElement): boolean {
    if (el.classList.contains('title-block')) return false;
    if (el.classList.contains('section-block')) return false;
    // As a PUSHED block: a figure is never shoved sideways or wrapped to make room for someone
    // else. Another block flows around it instead.
    if (isFigure(el)) return false;
    if (childToSection.has(el.id)) return false;
    const elLeft = parseInt(el.style.left);
    const elTop = parseInt(el.style.top);
    if (elLeft < movedLeft) return false;
    if (elTop < movedTop) return false;
    if (elTop >= movedBottom) return false;
    return true;
  }

  for (let iter = 0; iter < 100; iter++) {
    const els = [
      movedEl,
      ...Array.from(canvas.domElement.querySelectorAll<HTMLElement>('.block')).filter(
        (el) => el !== movedEl && inRegion(el),
      ),
    ].sort((a, b) => parseInt(a.style.left) - parseInt(b.style.left));

    let didMove = false;
    outer: for (let i = 0; i < els.length; i++) {
      for (let j = i + 1; j < els.length; j++) {
        const a = els[i], b = els[j];
        if (!blocksOverlap(a, b)) continue;

        const aRight = parseInt(a.style.left) + a.offsetWidth;
        const needed = margins.left + Math.round((aRight - margins.left) / GRID_SIZE) * GRID_SIZE;
        const maxLeft = CANVAS_W - margins.right - b.offsetWidth;

        if (needed > maxLeft) {
          const bH = b.offsetHeight;
          for (const other of canvas.domElement.querySelectorAll<HTMLElement>('.block')) {
            if (other === movedEl || other === b) continue;
            if (other.classList.contains('title-block')) continue;
            // And never dragged down by someone else's wrap — this is the `bH + GRID_SIZE` shove
            // that read as "it shifts it down two figure block heights".
            if (isFigure(other)) continue;
            if (childToSection.has(other.id)) continue;
            const otherTop = parseInt(other.style.top);
            if (otherTop >= wrapY) {
              placeBlock(other, parseInt(other.style.left), otherTop + bH + GRID_SIZE);
            }
          }
          placeBlock(b, margins.left, wrapY);
        } else {
          placeBlock(b, needed, parseInt(b.style.top));
        }
        didMove = true;
        break outer;
      }
    }
    if (!didMove) break;
  }
}

export function blockAtCursor(canvasX: number, canvasY: number): HTMLElement | null {
  for (const el of canvas.domElement.querySelectorAll<HTMLElement>('.block:not(.section-block)')) {
    const left = parseInt(el.style.left);
    const top = parseInt(el.style.top);
    if (
      canvasX >= left && canvasX <= left + el.offsetWidth &&
      canvasY >= top && canvasY <= top + el.offsetHeight
    ) {
      return el;
    }
  }
  return null;
}

export function moveGridCursor(canvasX: number, canvasY: number) {
  const snappedX = margins.left + Math.round((canvasX - margins.left) / GRID_SIZE) * GRID_SIZE;
  gridCursor.x = clamp(snappedX, margins.left, CANVAS_W - margins.right);

  // ⚠️ `gridOrigin` used to be defined here as `pi * PAGE_H + margins.top` and was left behind
  // when the bounds were consolidated into state.ts. So the CURSOR snapped to a lattice based at
  // the top margin while every BLOCK snapped to one based at the work-area top — two lattices
  // offset by `titleBlockH() mod GRID_SIZE`, identical whenever the title block was off, which is
  // why it hid. The in-page case now calls `snapToPageGrid`, the same function blocks use, so
  // there is no local origin left to drift.
  const pageEffTop = (pi: number) => pageWorkArea(pi).top;
  const pageEffBot = (pi: number) => pageWorkArea(pi).bottom;
  const firstGridY = firstGridLine;
  const lastGridY = lastGridLine;

  const rawPageIdx = Math.max(0, Math.floor(canvasY / PAGE_H));
  let finalY: number;

  if (canvasY < pageEffTop(rawPageIdx)) {
    finalY = rawPageIdx > 0 ? lastGridY(rawPageIdx - 1) : firstGridY(0);
  } else if (canvasY > pageEffBot(rawPageIdx)) {
    const next = rawPageIdx + 1;
    finalY = next * PAGE_H < CANVAS_H ? firstGridY(next) : lastGridY(rawPageIdx);
  } else {
    // The same snap a block gets, so the ghost sits exactly where the block will land.
    finalY = snapToPageGrid(canvasY);
  }
  gridCursor.y = finalY;
  canvas.moveGhost(gridCursor.x, gridCursor.y);
  const el = document.getElementById('cursor-coords');
  if (el) el.textContent = `x: ${gridCursor.x}px  y: ${gridCursor.y}px`;

  const hit = blockAtCursor(gridCursor.x, gridCursor.y);
  if (hit) {
    selectBlock(hit);
    const editable = hit.querySelector<HTMLElement>('input, [contenteditable="true"]');
    editable?.focus();
  } else {
    clearSelection();
  }
}

// ---------------------------------------------------------------------------
// Block rendering and dropping
// ---------------------------------------------------------------------------

export function renderBlock(block: Block) {
  canvas.addBlock(block);
}

// ---------------------------------------------------------------------------
// Splitting a block that laps onto the next page
// ---------------------------------------------------------------------------

/**
 * The bottom of the active work area on whichever page a block's top sits on — one definition in
 * state.ts bounds it by the top margin, the title block and the bottom margin together.
 */
function pageBottomFor(top: number): number {
  // The bottom of the LINED AREA, which is the guide's bottom edge and equals the bottom margin.
  //
  // v2.6.4 used lastGridLine here and that was wrong. The two bounds are not the same kind of
  // thing: a grid LINE is where a block's TOP may sit, while the lined BOX extends 8 px past the
  // final line (lines run 24, 44 … 1024; the guide ends at 1032). Content may fill to the box.
  return pageWorkArea(pageIndexOf(top)).bottom;
}

/**
 * The most source lines of a text block that still render within `budget` pixels.
 *
 * A formula block can be measured per row, because each row is its own element. Markdown has no
 * such correspondence — the renderer emits HTML into a flat list, so a rendered paragraph cannot be
 * traced back to the line that produced it, and one source line may be a heading, a blank, a
 * wrapped sentence or part of a code fence. The previous estimate scaled the line COUNT by the
 * height ratio, which assumes every line is equally tall; markdown violates that constantly.
 *
 * So the candidate is measured rather than guessed: render the first k lines into an offscreen
 * probe and binary-search k. ~5 renders of a small string per call, exact rather than proportional.
 *
 * The probe lives INSIDE the block and copies the view's class and width, because the rendered
 * height depends on both — `.md-view`'s line-height reads `--block-line-space`, which is set on the
 * block element, so a probe parented anywhere else would measure a different paragraph.
 */
function fittingLineCount(
  el: HTMLElement,
  view: HTMLElement,
  lines: string[],
  budget: number,
): number {
  const probe = document.createElement('div');
  probe.className = view.className;
  probe.style.cssText =
    `position:absolute;visibility:hidden;pointer-events:none;left:-99999px;top:0;` +
    `width:${view.clientWidth}px`;
  el.appendChild(probe);
  try {
    let lo = 1, best = 0;
    let hi = lines.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      probe.innerHTML = renderMarkdown(lines.slice(0, mid).join('\n'));
      if (probe.offsetHeight <= budget) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best;
  } finally {
    probe.remove();
  }
}

/** Only formula-ish and text blocks have a seam. A plot or figure has nowhere to cut. */
const SPLITTABLE = new Set<Block['type']>(['formula', 'summary', 'text']);

/**
 * Whether this block runs past its page's bottom margin AND can actually be cut there.
 *
 * Deliberately returns false rather than offering a split that would do nothing — an enabled menu
 * item that silently no-ops is worse than one that is absent.
 */
export function canSplitAtPageBreak(el: HTMLElement): boolean {
  const block = state.blocks.find((b) => b.id === el.id);
  if (!block || !SPLITTABLE.has(block.type) || block.parentSectionId) return false;
  const top = parseInt(el.style.top);
  if (!Number.isFinite(top)) return false;
  const avail = pageBottomFor(top) - top;
  if (el.offsetHeight <= avail) return false;
  return splitPointOf(el, block, avail) > 0;
}

/**
 * The split index (rows for a formula, lines for text) that both fits the page and is legal.
 *
 * Measurement is per row from the DOM rather than an estimate: rows differ in height with line
 * spacing, matrices, wrapped descriptions and stacked fractions, so a computed average would cut
 * in the wrong place on exactly the sheets that need this most.
 */
function splitPointOf(el: HTMLElement, block: Block, avail: number): number {
  // Everything is measured as a rect RELATIVE TO THE BLOCK, never via offsetTop.
  //
  // `.formula-rows` is `position: relative`, so it — not `.block` — is the offsetParent of every
  // row. `offsetTop` therefore never included the label, the divider or the block's 1rem top
  // padding, in either direction: v2.6.3 removed a `- base` subtraction believing it was adding the
  // header back, when the header had never been in the number at all. getBoundingClientRect has no
  // such dependency on which ancestors happen to be positioned.
  //
  // `chromeBelow` is the second half of it: `.block` has 1rem of padding and a 1px border BELOW the
  // last row, so a block sized to end exactly at the last row still overruns by 17px.
  const blockTop = el.getBoundingClientRect().top;
  const relBottom = (n: Element) => n.getBoundingClientRect().bottom - blockTop;

  if (block.type === 'text') {
    const view = el.querySelector<HTMLElement>('.md-view');
    const lines = (block.content || '').split('\n');
    if (!view || lines.length < 2) return 0;
    const chromeBelow = el.offsetHeight - relBottom(view);
    const forContent = avail - (view.getBoundingClientRect().top - blockTop) - chromeBelow;
    if (forContent <= 0) return 0;
    return safeTextSplitLine(block.content || '', fittingLineCount(el, view, lines, forContent));
  }
  const rowEls = Array.from(el.querySelectorAll<HTMLElement>('.formula-rows > .formula-row'));
  if (rowEls.length < 2) return 0;
  // Whatever sits below the last row — padding, border, the resize handle — travels with the block
  // whichever rows it keeps, so it comes out of the budget for every candidate.
  const chromeBelow = el.offsetHeight - relBottom(rowEls[rowEls.length - 1]);
  let want = rowEls.length - 1;
  for (let i = 0; i < rowEls.length; i++) {
    if (relBottom(rowEls[i]) + chromeBelow > avail) {
      want = i;
      break;
    }
  }
  return safeSplitIndex(parseFormulaRows(block.content), want);
}

/**
 * Move everything past the page break into a new block at the top of the next page.
 *
 * Returns the new block's id, or null when nothing could be moved. The original keeps its
 * identity — so any section membership, pack fields and input values stay with it — and the new
 * block carries only what a continuation needs.
 */
function splitOnce(el: HTMLElement): string | null {
  const block = state.blocks.find((b) => b.id === el.id);
  if (!block || !SPLITTABLE.has(block.type)) return null;
  const top = parseInt(el.style.top);
  const avail = pageBottomFor(top) - top;
  const at = splitPointOf(el, block, avail);
  if (at <= 0) return null;
  // Where the block's content ENDED before the cut. Everything below it is positioned relative to
  // this, so it is what the shift below is measured against — captured now, before the DOM shrinks.
  const prevBottom = top + el.offsetHeight;

  let movedContent: string;
  if (block.type === 'text') {
    const lines = (block.content || '').split('\n');
    movedContent = lines.slice(at).join('\n');
    block.content = lines.slice(0, at).join('\n');
  } else {
    const rows = parseFormulaRows(block.content);
    movedContent = JSON.stringify(rows.slice(at));
    block.content = JSON.stringify(rows.slice(0, at));
  }

  const nextPage = pageIndexOf(top) + 1;
  // The first GRID LINE below that page's title block, not the bare content top. pageContentTop is
  // `margin + titleBlockH`, and TITLE_BLOCK_H (112) is not a multiple of GRID_SIZE (20) — so using
  // it directly placed the continuation 8 px off the lines every time, which is the second half of
  // the 2026-10-02 report: it did not know where the top of the next page's lined area was.
  const newTop = firstGridLine(nextPage);
  const copy: Block = {
    id: newBlockId(),
    type: block.type,
    subtype: block.subtype,
    x: block.x,
    y: newTop - margins.top,
    w: block.w,
    content: movedContent,
    // "(cont.)" because a continuation carrying the same title reads, on a printed sheet, as two
    // independent calculations that happen to share a name.
    label: block.label ? `${block.label} (cont.)` : undefined,
    lineSpacing: block.lineSpacing,
  };

  state.blocks.push(copy);
  // The new block may itself sit past the last page; grow the canvas before placing it.
  setNumPages(Math.max(numPages, nextPage + 1));
  setCANVAS_H(numPages * PAGE_H);
  canvas.domElement.style.height = `${CANVAS_H}px`;
  syncPageSeparators();
  renderBlock(copy);

  // Make room for the continuation: anything already sitting at or below where it lands moves
  // down. Without this the continuation is simply drawn on top of whatever was on the next page
  // (reported 2026-10-02) — a split silently hid a block instead of relocating it.
  //
  // Measured after render, because the height is the content's, not something we can predict.
  // Rounded UP to a whole number of grid squares so everything below stays on the lines, and
  // GRID_SIZE is added so the blocks end up a square apart rather than flush.
  const copyEl = document.getElementById(copy.id);
  if (copyEl) {
    const copyBottom = newTop + copyEl.offsetHeight;
    // The content used to end at `prevBottom` and now ends at `copyBottom`, so everything that
    // followed moves by the DIFFERENCE. That preserves each following block's gap from the end of
    // the split block exactly, which is the point: shifting by the continuation's whole height
    // instead pushed a block that was already well down the page onto the next one
    // (reported 2026-10-02 as "aggressive").
    const relDelta = copyBottom - prevBottom;

    const followingTops = state.blocks
      .filter((b) => b.id !== copy.id && b.id !== block.id && !b.parentSectionId)
      .map((b) => parseInt(document.getElementById(b.id)?.style.top ?? ''))
      .filter((t) => Number.isFinite(t) && t >= newTop);

    if (followingTops.length) {
      // A block the OLD block was already overlapping has a negative original gap, so preserving
      // it would preserve the overlap. In that case clear the continuation by one square instead.
      const clearance = copyBottom + GRID_SIZE - Math.min(...followingTops);
      const raw = clearance > 0 ? Math.max(relDelta, clearance) : relDelta;
      // A whole number of squares, away from zero, so everything below stays on the lines.
      const delta = raw >= 0
        ? Math.ceil(raw / GRID_SIZE) * GRID_SIZE
        : Math.floor(raw / GRID_SIZE) * GRID_SIZE;
      if (delta !== 0) shiftBlocksVertical(newTop, delta, copy.id);
    }
  }

  // Re-render the shortened original so its rows match its content again.
  const stale = document.getElementById(block.id);
  if (stale) {
    stale.remove();
    renderBlock(block);
  }
  reEvalAllFormulas();
  updatePageCount();
  syncTitleBlocks();
  canvas.updateMarginGuide();
  return copy.id;
}

/**
 * Split repeatedly until no part laps over a page break.
 *
 * One cut only suffices for a block that overflows by less than a page. A block three pages long
 * produced a continuation that itself ran past the NEXT page's bottom margin, so the overflow just
 * moved down the document — which is what "it is still not taking the page boundaries into account"
 * looks like from the outside.
 *
 * Progress is required, not assumed: splitOnce returns null when there is no legal cut, and the
 * pass bound is a backstop against a measurement that never converges rather than an expected
 * limit. Only the final piece is selected, so the user ends up looking at the last page written.
 */
export function splitAtPageBreak(el: HTMLElement): string | null {
  let lastId: string | null = null;
  // A worklist, not a walk down the chain. Jon's acceptance criterion, 2026-10-02: "the top left
  // corner of the block and the bottom right corner of the block must be within the working grid
  // area of the sheet after the split." That is a statement about EVERY resulting block, so the
  // ORIGINAL has to be re-examined too — splitting it shortens it, but the reposition that follows
  // can move it, and a single walk forward onto the continuation never looks back at it.
  const work: string[] = [el.id];
  for (let pass = 0; pass < 60 && work.length; pass++) {
    const current = document.getElementById(work.shift()!);
    if (!current || !canSplitAtPageBreak(current)) continue;
    const id = splitOnce(current);
    if (!id) continue; // overflows but has no legal cut — leave it marked and move on
    lastId = id;
    work.push(current.id, id); // both halves are candidates; either may still overrun
  }
  if (lastId) {
    const finalEl = document.getElementById(lastId);
    if (finalEl) selectBlock(finalEl);
  }
  return lastId;
}

/**
 * Mark every block that runs past its page's bottom margin, so the overlap is visible and the
 * right-click menu's split option is discoverable. A marker rather than a dialog: a block can
 * start overlapping because rows were added, margins changed or the title block was switched on,
 * and interrupting any of those with a modal would be worse than the overlap.
 */
export function markPageOverflow() {
  for (const el of canvas.domElement.querySelectorAll<HTMLElement>('.block')) {
    if (el.classList.contains('title-block') || childToSection.has(el.id)) continue;
    const top = parseInt(el.style.top);
    const over = Number.isFinite(top) && el.offsetHeight > pageBottomFor(top) - top;
    el.classList.toggle('block--overflows-page', over);
  }
}

// ---------------------------------------------------------------------------
// Copy / paste
// ---------------------------------------------------------------------------

const newBlockId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Snapshot the given block elements into the clipboard buffer.
 *
 * A copied **section** takes its children with it. Without that, copying a section would place an
 * empty one and quietly lose the calculation inside — the kind of silent loss that is only noticed
 * after the sheet is printed. Children are stored after their section so paste can remap them.
 *
 * Child blocks selected on their own are copied as plain blocks: pasting a lone child onto the
 * canvas gives a canvas block, which is the only sensible reading when its section is not involved.
 */
export function copyBlocks(els: HTMLElement[]) {
  const ids = new Set(els.map((e) => e.id));
  const picked: Block[] = [];
  for (const b of state.blocks) {
    if (ids.has(b.id)) picked.push({ ...b });
  }
  // Children of any copied section, even when not themselves selected.
  for (const b of state.blocks) {
    if (b.parentSectionId && ids.has(b.parentSectionId) && !ids.has(b.id)) {
      picked.push({ ...b });
    }
  }
  setClipboardBlocks(picked);
}

/**
 * Re-create the clipboard contents as new blocks, offset one grid square down and right so the
 * copy is visibly its own object rather than sitting exactly on the original.
 *
 * Every block gets a fresh id and `parentSectionId` is remapped through an id map, so a pasted
 * section owns its pasted children rather than re-parenting the originals — which would move the
 * source section's contents into the copy and leave the original empty.
 */
export function pasteBlocks(): number {
  if (clipboardBlocks.length === 0) return 0;

  const idMap = new Map<string, string>();
  for (const b of clipboardBlocks) idMap.set(b.id, newBlockId());

  const made: Block[] = [];
  for (const src of clipboardBlocks) {
    const copy: Block = { ...src, id: idMap.get(src.id)! };
    // `inputs` is a nested object; a shallow spread would have the copy and the original share it,
    // so typing into one would change the other.
    if (src.inputs) copy.inputs = { ...src.inputs };
    if (src.parentSectionId) {
      const mapped = idMap.get(src.parentSectionId);
      // Parent came along → stay a child of the copy. Parent did not → become a canvas block,
      // rather than silently remaining attached to the ORIGINAL section.
      if (mapped) copy.parentSectionId = mapped;
      else delete copy.parentSectionId;
    }
    if (!copy.parentSectionId) {
      copy.x += GRID_SIZE;
      copy.y += GRID_SIZE;
    }
    made.push(copy);
  }

  for (const b of made) {
    state.blocks.push(b);
    if (!b.parentSectionId) renderBlock(b);
  }
  // Children after their sections exist, mirroring loadProject's two-pass attach.
  for (const b of made) {
    if (!b.parentSectionId) continue;
    const sectionEl = document.getElementById(b.parentSectionId);
    const content = sectionEl?.querySelector<HTMLElement>('.section-content');
    if (!content) continue;
    renderBlock(b);
    const childEl = document.getElementById(b.id);
    if (!childEl) continue;
    content.appendChild(childEl);
    childEl.style.left = `${b.x}px`;
    childEl.style.top = `${b.y}px`;
    childEl.style.maxWidth = '';
    childToSection.set(b.id, b.parentSectionId);
    refreshSectionHeight(sectionEl!);
  }

  clearSelection();
  for (const b of made) {
    if (b.parentSectionId) continue;
    const el = document.getElementById(b.id);
    if (el) addToSelection(el);
  }
  reEvalAllFormulas();
  updatePageCount();
  return made.filter((b) => !b.parentSectionId).length;
}

/** The size a new figure is created at — also what the free-slot search must reserve. */
const FIGURE_W = 240;
const FIGURE_H = 200;

/**
 * Where a newly placed figure actually lands: at the cursor, unless something is already there.
 *
 * When the chosen spot is occupied it advances to the RIGHT along the same row, past the right
 * edge of whatever it hit, and only when nothing fits before the last grid column does it wrap to
 * the next row. "It should be able to be placed left to right then top to bottom if no space
 * remains. And only if no space remains, instead of forcing it to go below automatically."
 * (Jon, 2026-10-07.)
 *
 * An EMPTY spot is never adjusted — pick a clear point and the figure lands exactly there. This
 * only decides what happens when two figures would occupy the same place, which is what repeated
 * double-clicks without moving the cursor used to do: stack them invisibly on top of each other.
 *
 * Coordinates here are absolute canvas px, the same frame as `el.style.left` / `top`.
 */
function freeFigureSlot(x: number, y: number, w: number, h: number): { x: number; y: number } {
  const rightLimit = lastGridColumn();
  const taken = Array.from(canvas.domElement.querySelectorAll<HTMLElement>('.block'))
    .filter((el) => !el.classList.contains('title-block') && !childToSection.has(el.id))
    .map((el) => ({
      l: parseInt(el.style.left),
      t: parseInt(el.style.top),
      w: el.offsetWidth,
      h: el.offsetHeight,
    }))
    .filter((r) => Number.isFinite(r.l) && Number.isFinite(r.t));

  const hitAt = (px: number, py: number) =>
    taken.find((r) => px < r.l + r.w && px + w > r.l && py < r.t + r.h && py + h > r.t);

  let px = x, py = y;
  // Bounded: a pathological sheet must not hang the placement.
  for (let i = 0; i < 200; i++) {
    const hit = hitAt(px, py);
    if (!hit) return { x: px, y: py };
    const nextX = margins.left +
      Math.ceil((hit.l + hit.w - margins.left) / GRID_SIZE) * GRID_SIZE;
    if (nextX + w <= rightLimit) {
      px = nextX; // room remains on this row — go right, not down
      continue;
    }
    py = snapToPageGrid(hit.t + hit.h); // the row is full, and only then: next row
    px = margins.left;
  }
  return { x: px, y: py };
}

export function dropBlock(type: Block['type'], subtype: string, canvasX: number, canvasY: number) {
  // A Summary block is the Section's companion (pro+): it only has meaning inside a section, where it
  // feeds the section summary line. Refuse other placements — but say so; this used to be silent,
  // which read as "the block won't place".
  if (type === 'summary' && !sectionAtPoint(canvasX, canvasY)) {
    alert(
      'Summary blocks go inside a Section.\n\nDrop it onto an open section, or click inside one ' +
        'and double-click Summary Block again.',
    );
    return;
  }

  const customMod = type === 'formula' && subtype
    ? customModules.find((m) => m.id === subtype)
    : undefined;

  if (customMod?.blocks) {
    clearSelection();
    const baseX = canvasX - margins.left;
    const baseY = canvasY - margins.top;
    const targetSection = sectionAtPoint(canvasX, canvasY);
    for (const b of customMod.blocks) {
      const block: Block = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: b.type,
        subtype: b.subtype,
        x: baseX + b.dx,
        y: baseY + b.dy,
        w: b.w,
        content: b.content,
        label: b.label,
      };
      state.blocks.push(block);
      renderBlock(block);
      const el = document.getElementById(block.id);
      if (el) {
        if (targetSection) reparentToSection(el, targetSection);
        selectedEls.add(el);
        el.classList.add('selected');
        setSelectedEl(el);
      }
    }
    reEvalAllFormulas();
    updatePageCount();
    return;
  }

  // A figure lands at the cursor when the spot is clear, and flows right — then down only when
  // the row is full — when it is not. Computed in absolute canvas px, snapped the same way
  // `addBlock` will snap it, so the overlap test sees the rect the block will really occupy.
  let dropX = canvasX - margins.left;
  let dropY = canvasY - margins.top;
  if (type === 'figure') {
    const absX = margins.left + Math.round((canvasX - margins.left) / GRID_SIZE) * GRID_SIZE;
    const absY = snapToPageGrid(canvasY);
    const slot = freeFigureSlot(absX, absY, FIGURE_W, FIGURE_H);
    dropX = slot.x - margins.left;
    dropY = slot.y - margins.top;
  }

  const block: Block = {
    // Date.now() alone collides for two blocks created in the same millisecond — and block ids
    // are DOM element ids, so getElementById then resolves to whichever came first and a child
    // can be reparented into the wrong section. The multi-block tool path above already
    // randomises; this is the same suffix.
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    subtype,
    x: dropX,
    y: dropY,
    content: customMod
      ? customMod.content
      : type === 'formula'
      ? 'x = '
      : type === 'summary'
      ? 'x = '
      : '',
    label: customMod
      ? customMod.label
      : type === 'formula'
      ? 'Formula'
      : type === 'summary'
      ? 'Summary'
      : type === 'figure'
      ? `Fig ${nextFigureNum()}`
      : undefined,
    w: type === 'figure' ? FIGURE_W : undefined,
    h: type === 'figure' ? FIGURE_H : undefined,
    sectionName: type === 'section' ? nextSectionName() : undefined,
  };
  state.blocks.push(block);
  renderBlock(block);
  const el = document.getElementById(block.id);
  if (el) {
    if (type !== 'section') {
      const targetSection = sectionAtPoint(canvasX, canvasY);
      if (targetSection) reparentToSection(el, targetSection);
    }
    selectBlock(el);
  }
  reEvalAllFormulas();
  updatePageCount();
}
