// ---------------------------------------------------------------------------
// DnD — selection, deletion, cursor, page management, block placement, drop
// ---------------------------------------------------------------------------

import { type Block, type TitleBlockData, GRID_SIZE } from './types.ts';
import {
  state, canvas,
  CANVAS_W, CANVAS_H, PAGE_H, margins, titleBlockEnabled, numPages,
  selectedEl, setSelectedEl, selectedEls,
  deletionStack, childToSection,
  customModules,
  setNumPages, setCANVAS_H, titleBlockH,
  gridCursor,
} from './state.ts';
import { clamp } from './utils/units.ts';
import { reEvalAllFormulas } from './blocks/formula.ts';
import { unparentFromSection, reparentToSection, sectionAtPoint, nextSectionName } from './blocks/section.ts';
import { nextFigureNum } from './blocks/figure.ts';

// ---------------------------------------------------------------------------
// Cursor visibility
// ---------------------------------------------------------------------------

export function showCursor() { document.getElementById('grid-cursor')!.style.zIndex = '9999'; }
export function hideCursor() { document.getElementById('grid-cursor')!.style.zIndex = '-1'; }

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
export function shiftBlocksVertical(thresholdY: number, delta: number) {
  for (const el of canvas.domElement.querySelectorAll<HTMLElement>('.block')) {
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
  if (!state.titleBlock) state.titleBlock = { project: '', by: '', sheetNo: '', subject: '', subject2: '', subject3: '', date: '', jobNo: '' };
  const w = CANVAS_W - margins.left - margins.right;
  for (let i = 0; i < numPages; i++) {
    const el = document.createElement('div');
    el.className = 'block title-block title-block-overlay';
    el.style.left     = `${margins.left}px`;
    el.style.top      = `${i * PAGE_H + margins.top}px`;
    el.style.width    = `${w}px`;
    el.style.maxWidth = '';
    el.style.zIndex   = '2';
    buildTitleBlockOverlay(el, i);
    canvas.domElement.appendChild(el);
  }
}

// Rebuild page-separator bars and per-page margin guides to match numPages.
export function syncPageSeparators() {
  canvas.domElement.querySelectorAll('.page-sep, .page-guide, .page-num').forEach((e) => e.remove());
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
  // Suppressed when the title block is active (sheet no. shown there instead).
  if (!titleBlockEnabled) {
    for (let i = 1; i <= numPages; i++) {
      const pn = document.createElement('div');
      pn.className = 'page-num';
      pn.textContent = `Page ${i} of ${numPages}`;
      pn.style.top   = `${i * PAGE_H - margins.bottom}px`;
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

  const data = state.titleBlock ?? { project: '', by: '', sheetNo: '', subject: '', subject2: '', subject3: '', date: '', jobNo: '' };
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
    td.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); td.blur(); } });
    return td;
  }

  const logoTd = document.createElement('td');
  logoTd.className = 'tb-logo';
  logoTd.rowSpan = 4;

  const logoImg = document.createElement('img');
  logoImg.className = 'tb-logo-img';
  if (data.logo) { logoImg.src = data.logo; logoImg.style.display = ''; }
  else logoImg.style.display = 'none';

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
        const ph  = o.querySelector<HTMLElement>('.tb-logo-ph');
        if (img) { img.src = url; img.style.display = ''; }
        if (ph)  { ph.style.display = 'none'; }
      });
    };
    reader.readAsDataURL(file);
  });

  logoTd.appendChild(logoImg);
  logoTd.appendChild(logoPh);
  logoTd.appendChild(fileInput);
  logoTd.addEventListener('click', (ev) => { ev.stopPropagation(); fileInput.click(); });
  logoTd.addEventListener('mousedown', (ev) => ev.stopPropagation());

  const lbProject = makeLabel('Project');  lbProject.style.width  = '68px';
  const lbBy       = makeLabel('By');      lbBy.style.width       = '68px';
  const lbSheetNo  = makeLabel('Sheet No.'); lbSheetNo.style.width = '68px';
  const ROW_H = '28px';
  const row1 = document.createElement('tr'); row1.style.height = ROW_H;
  row1.appendChild(logoTd);
  row1.appendChild(lbProject);
  row1.appendChild(makeValue('project', 'tb-wide'));
  row1.appendChild(lbBy);
  row1.appendChild(lbSheetNo);
  table.appendChild(row1);

  const sheetNoTd = document.createElement('td');
  sheetNoTd.className = 'tb-value tb-narrow tb-sheet-num';
  sheetNoTd.textContent = `${pageIdx + 1} of ${numPages}`;
  const row2 = document.createElement('tr'); row2.style.height = ROW_H;
  row2.appendChild(makeLabel('Subject'));
  row2.appendChild(makeValue('subject', 'tb-wide'));
  row2.appendChild(makeValue('by'));
  row2.appendChild(sheetNoTd);
  table.appendChild(row2);

  const row3 = document.createElement('tr'); row3.style.height = ROW_H;
  const blank3 = document.createElement('td');
  blank3.className = 'tb-blank';
  row3.appendChild(blank3);
  row3.appendChild(makeValue('subject2', 'tb-wide'));
  row3.appendChild(makeLabel('Date'));
  row3.appendChild(makeLabel('Job No.'));
  table.appendChild(row3);

  const row4 = document.createElement('tr'); row4.style.height = ROW_H;
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
  if (b?.type === 'section') {
    el.style.left = `${margins.left}px`;
    el.style.top  = `${newTop}px`;
    el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
    el.style.maxWidth = '';
    b.x = 0;
    b.y = newTop - margins.top - titleBlockH();
    return;
  }
  el.style.left = `${newLeft}px`;
  el.style.top = `${newTop}px`;
  el.style.maxWidth = `${CANVAS_W - margins.right - newLeft}px`;
  if (b) { b.x = newLeft - margins.left; b.y = newTop - margins.top; }
}

export function blocksOverlap(a: HTMLElement, b: HTMLElement): boolean {
  const aL = parseInt(a.style.left), aT = parseInt(a.style.top);
  const aR = aL + a.offsetWidth,    aB = aT + a.offsetHeight;
  const bL = parseInt(b.style.left), bT = parseInt(b.style.top);
  const bR = bL + b.offsetWidth,    bB = bT + b.offsetHeight;
  return aR > bL && aL < bR && aB > bT && aT < bB;
}

// When moving a block right, cascade-push any block it collides with.
export function resolveOverlapsRight(movedEl: HTMLElement) {
  if (movedEl.classList.contains('title-block') || movedEl.classList.contains('section-block')) return;

  const movedLeft   = parseInt(movedEl.style.left);
  const movedTop    = parseInt(movedEl.style.top);
  const movedBottom = movedTop + movedEl.offsetHeight;

  const wrapY = margins.top + Math.ceil((movedBottom - margins.top) / GRID_SIZE) * GRID_SIZE;

  function inRegion(el: HTMLElement): boolean {
    if (el.classList.contains('title-block'))  return false;
    if (el.classList.contains('section-block')) return false;
    if (childToSection.has(el.id))             return false;
    const elLeft = parseInt(el.style.left);
    const elTop  = parseInt(el.style.top);
    if (elLeft < movedLeft) return false;
    if (elTop < movedTop)   return false;
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

        const aRight  = parseInt(a.style.left) + a.offsetWidth;
        const needed  = margins.left + Math.round((aRight - margins.left) / GRID_SIZE) * GRID_SIZE;
        const maxLeft = CANVAS_W - margins.right - b.offsetWidth;

        if (needed > maxLeft) {
          const bH = b.offsetHeight;
          for (const other of canvas.domElement.querySelectorAll<HTMLElement>('.block')) {
            if (other === movedEl || other === b) continue;
            if (other.classList.contains('title-block'))  continue;
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
    if (canvasX >= left && canvasX <= left + el.offsetWidth &&
        canvasY >= top  && canvasY <= top  + el.offsetHeight) {
      return el;
    }
  }
  return null;
}

export function moveGridCursor(canvasX: number, canvasY: number) {
  const tbH = titleBlockH();

  const snappedX = margins.left + Math.round((canvasX - margins.left) / GRID_SIZE) * GRID_SIZE;
  gridCursor.x = clamp(snappedX, margins.left, CANVAS_W - margins.right);

  const gridOrigin  = (pi: number) => pi * PAGE_H + margins.top;
  const pageEffTop  = (pi: number) => pi * PAGE_H + margins.top + tbH;
  const pageEffBot  = (pi: number) => pi * PAGE_H + PAGE_H - margins.bottom;
  const firstGridY  = (pi: number) => {
    const go = gridOrigin(pi);
    return go + Math.ceil((pageEffTop(pi) - go) / GRID_SIZE) * GRID_SIZE;
  };
  const lastGridY   = (pi: number) => {
    const go = gridOrigin(pi);
    return go + Math.floor((pageEffBot(pi) - go) / GRID_SIZE) * GRID_SIZE;
  };

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

export function dropBlock(type: Block['type'], subtype: string, canvasX: number, canvasY: number) {
  if (type === 'summary' && !sectionAtPoint(canvasX, canvasY)) return;

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
        selectedEls.add(el); el.classList.add('selected'); setSelectedEl(el);
      }
    }
    reEvalAllFormulas();
    updatePageCount();
    return;
  }

  const block: Block = {
    id: `block-${Date.now()}`,
    type,
    subtype,
    x: canvasX - margins.left,
    y: canvasY - margins.top,
    content: customMod ? customMod.content
           : type === 'formula' ? 'x = '
           : type === 'summary' ? 'x = '
           : '',
    label: customMod ? customMod.label
           : type === 'formula' ? 'Formula'
           : type === 'summary' ? 'Summary'
           : type === 'figure'  ? `Fig ${nextFigureNum()}`
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
