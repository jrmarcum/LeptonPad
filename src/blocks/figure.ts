// ---------------------------------------------------------------------------
// Figure block — image with auto-numbered label and editable caption
// ---------------------------------------------------------------------------

import { type Block, type FigureData, GRID_SIZE } from '../types.ts';
import { state } from '../state.ts';

/** Return the next "Fig N" number, scanning all existing figure blocks. */
function nextFigureNum(): number {
  let max = 0;
  for (const b of state.blocks) {
    if (b.type === 'figure' && b.label) {
      const m = b.label.match(/^Fig\s+(\d+)$/i);
      if (m) max = Math.max(max, parseInt(m[1]));
    }
  }
  return max + 1;
}

export { nextFigureNum };

export function buildFigureBlock(el: HTMLElement, block: Block) {
  el.classList.add('figure-block');

  const DEFAULT_W = 240;
  const DEFAULT_H = 200;
  el.style.width  = `${block.w ?? DEFAULT_W}px`;
  el.style.height = `${block.h ?? DEFAULT_H}px`;

  let data: FigureData;
  try { data = JSON.parse(block.content || '{}') as FigureData; }
  catch { data = { src: '', caption: '' }; }

  // ── Label header ──────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'figure-label';
  header.textContent = block.label ?? 'Figure';
  el.appendChild(header);

  // ── Image area ────────────────────────────────────────────────────────────
  const imgWrap = document.createElement('div');
  imgWrap.className = 'figure-img-wrap';

  const img = document.createElement('img');
  img.className = 'figure-img';
  img.draggable = false;
  img.alt = '';

  const placeholder = document.createElement('div');
  placeholder.className = 'figure-placeholder';
  placeholder.innerHTML = '<span>Paste image (Ctrl+V)<br>or click to upload</span>';

  function loadSrc(src: string) {
    data.src = src;
    block.content = JSON.stringify(data);
    img.src = src;
    img.style.display = '';
    placeholder.style.display = 'none';
    const applyAspect = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const w = el.offsetWidth;
      const chromeH = header.offsetHeight + caption.offsetHeight;
      const imgH = Math.round((w / (img.naturalWidth / img.naturalHeight)) / GRID_SIZE) * GRID_SIZE;
      block.h = Math.max(GRID_SIZE * 2, imgH) + chromeH;
      el.style.height = `${block.h}px`;
    };
    if (img.complete && img.naturalWidth) applyAspect();
    else img.onload = applyAspect;
  }

  if (data.src) {
    img.src = data.src;
    img.style.display = '';
    placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
  }

  // Hidden file input for click-to-upload
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadSrc(reader.result as string);
    reader.readAsDataURL(file);
  });
  placeholder.addEventListener('click', () => fileInput.click());

  imgWrap.appendChild(img);
  imgWrap.appendChild(placeholder);
  el.appendChild(imgWrap);

  // ── Caption ───────────────────────────────────────────────────────────────
  const caption = document.createElement('div');
  caption.className = 'figure-caption';
  caption.contentEditable = 'true';
  caption.dataset.placeholder = 'Caption…';
  caption.textContent = data.caption || '';
  caption.addEventListener('mousedown', (e) => e.stopPropagation());
  caption.addEventListener('blur', () => {
    data.caption = caption.textContent ?? '';
    block.content = JSON.stringify(data);
  });
  el.appendChild(caption);
  el.appendChild(fileInput);

  // tabIndex so the block element can receive paste events
  el.tabIndex = 0;

  // Paste handler — intercepts clipboard images
  el.addEventListener('paste', (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => loadSrc(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }
    }
  });

  // ── Right-edge resize handle ──────────────────────────────────────────────
  const rightHandle = document.createElement('div');
  rightHandle.className = 'figure-resize-handle';
  rightHandle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    e.preventDefault();
    rightHandle.setPointerCapture(e.pointerId);
    rightHandle.classList.add('handle-active');
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const onMove = (mv: PointerEvent) => {
      const newW = Math.max(80, Math.round((startW + (mv.clientX - startX)) / GRID_SIZE) * GRID_SIZE);
      block.w = newW;
      el.style.width = `${newW}px`;
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
  bottomHandle.className = 'figure-bottom-handle';
  bottomHandle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    e.preventDefault();
    bottomHandle.setPointerCapture(e.pointerId);
    bottomHandle.classList.add('handle-active');
    const startY = e.clientY;
    const startH = el.offsetHeight;
    const onMove = (mv: PointerEvent) => {
      const newH = Math.max(GRID_SIZE * 3, Math.round((startH + (mv.clientY - startY)) / GRID_SIZE) * GRID_SIZE);
      block.h = newH;
      el.style.height = `${newH}px`;
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

  // Stop mousedown inside img/placeholder from starting a block drag
  imgWrap.addEventListener('mousedown', (e) => {
    const t = e.target as HTMLElement;
    if (t !== rightHandle && t !== bottomHandle) e.stopPropagation();
  });
}
