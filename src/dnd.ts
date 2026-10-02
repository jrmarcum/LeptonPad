// ---------------------------------------------------------------------------
// DnD — selection, deletion, cursor, page management, block placement, drop
// ---------------------------------------------------------------------------

import { type Block, GRID_SIZE, type TitleBlockData } from './types.ts';
import {
  canvas,
  CANVAS_H,
  CANVAS_W,
  childToSection,
  clearTitleBlock,
  clipboardBlocks,
  customModules,
  deletionStack,
  firstGridLine,
  gridCursor,
  lastGridLine,
  margins,
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
  state,
  titleBlockEnabled,
  titleBlockH,
} from './state.ts';
import { clamp } from './utils/units.ts';
import { parseFormulaRows, reEvalAllFormulas, safeSplitIndex } from './blocks/formula.ts';
import { safeTextSplitLine } from './blocks/text.ts';
import {
  nextSectionName,
  refreshSectionHeight,
  reparentToSection,
  sectionAtPoint,
  unparentFromSection,
} from './blocks/pro/section.ts';
import { nextFigureNum } from './blocks/figure.ts';

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
export function shiftBlocksVertical(thresholdY: number, delta: number) {
  for (const el of canvas.domElement.querySelectorAll<HTMLElement>('.block')) {
    if (el.classList.contains('title-block') || childToSection.has(el.id)) continue;
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
    el.style.top = `${i * PAGE_H + margins.top}px`;
    el.style.width = `${w}px`;
    el.style.maxWidth = '';
    el.style.zIndex = '2';
    buildTitleBlockOverlay(el, i);
    canvas.domElement.appendChild(el);
  }
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
    const bot = parseInt(el.style.top) + el.offsetHeight;
    if (bot > maxBottom) maxBottom = bot;
  }
  // Before the early return below, which is the common case — a block that laps over a page
  // break usually does so without changing the page COUNT at all, so marking it after that
  // return would mean the marker only ever appeared when a page was added or removed.
  markPageOverflow();

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
  newTop = clearTitleBlock(newTop);
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
  el.style.maxWidth = `${CANVAS_W - margins.right - newLeft}px`;
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

// When moving a block right, cascade-push any block it collides with.
export function resolveOverlapsRight(movedEl: HTMLElement) {
  if (movedEl.classList.contains('title-block') || movedEl.classList.contains('section-block')) {
    return;
  }

  const movedLeft = parseInt(movedEl.style.left);
  const movedTop = parseInt(movedEl.style.top);
  const movedBottom = movedTop + movedEl.offsetHeight;

  const wrapY = margins.top + Math.ceil((movedBottom - margins.top) / GRID_SIZE) * GRID_SIZE;

  function inRegion(el: HTMLElement): boolean {
    if (el.classList.contains('title-block')) return false;
    if (el.classList.contains('section-block')) return false;
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

  // These were the ONLY correct copy of the page-band rule; they are now the shared definition in
  // state.ts, so the split and load-time placement measure against the same lines the cursor does.
  const gridOrigin = (pi: number) => pi * PAGE_H + margins.top;
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
    const go = gridOrigin(rawPageIdx);
    finalY = go + Math.round((canvasY - go) / GRID_SIZE) * GRID_SIZE;
    finalY = clamp(finalY, firstGridY(rawPageIdx), lastGridY(rawPageIdx));
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
  // `avail` is measured from the BLOCK's top, and `offsetTop` on a descendant is relative to the
  // block (it is the positioned offsetParent) — so the two are already in the same frame and the
  // block's own chrome is counted automatically.
  //
  // This is where it was wrong: the row loop subtracted the first row's offsetTop as a "base",
  // which discarded the label, the divider and the block's top padding. The kept part was then
  // allowed to be (chrome + avail) tall and still ran past the bottom margin by exactly the height
  // of its own header. The text path had the same hole — it ignored `view.offsetTop`.
  if (block.type === 'text') {
    const view = el.querySelector<HTMLElement>('.md-view');
    const lines = (block.content || '').split('\n');
    if (!view || lines.length < 2) return 0;
    const forContent = avail - view.offsetTop;
    if (forContent <= 0) return 0;
    // Proportional: the rendered view has no per-line elements to measure. Over-estimating is
    // safe because safeTextSplitLine only ever walks the candidate BACK, never forward.
    const want = Math.floor(lines.length * (forContent / Math.max(1, view.offsetHeight)));
    return safeTextSplitLine(block.content || '', Math.min(want, lines.length - 1));
  }
  const rowEls = Array.from(el.querySelectorAll<HTMLElement>('.formula-rows > .formula-row'));
  if (rowEls.length < 2) return 0;
  let want = rowEls.length - 1;
  for (let i = 0; i < rowEls.length; i++) {
    if (rowEls[i].offsetTop + rowEls[i].offsetHeight > avail) {
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
  let current: HTMLElement | null = el;
  for (let pass = 0; pass < 40 && current; pass++) {
    const id = splitOnce(current);
    if (!id) break;
    lastId = id;
    const next = document.getElementById(id);
    // Carry on only while the piece just created still overflows AND can be cut again.
    current = next && canSplitAtPageBreak(next) ? next : null;
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

  const block: Block = {
    // Date.now() alone collides for two blocks created in the same millisecond — and block ids
    // are DOM element ids, so getElementById then resolves to whichever came first and a child
    // can be reparented into the wrong section. The multi-block tool path above already
    // randomises; this is the same suffix.
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    subtype,
    x: canvasX - margins.left,
    y: canvasY - margins.top,
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
    w: type === 'figure' ? 240 : undefined,
    h: type === 'figure' ? 200 : undefined,
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
