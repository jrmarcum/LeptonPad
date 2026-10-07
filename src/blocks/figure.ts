// ---------------------------------------------------------------------------
// Figure block — image with auto-numbered label and editable caption
// ---------------------------------------------------------------------------

import { type Block, type FigureData, GRID_SIZE } from '../types.ts';
import { blockMaxBox, onUpdatePageCount, state } from '../state.ts';

/** Floor for a figure's width and height, matching what the two resize handles already enforced. */
const MIN_W = 80;
const MIN_H = GRID_SIZE * 3;

/** The work-area box this figure may grow into. Shared with every other resizable block. */
const figureMaxBox = (el: HTMLElement, block: Block) => blockMaxBox(el, block, MIN_W, MIN_H);

/** Snap to the grid, then hard-cap — rounding UP must never re-cross the bound. */
export function snapWithin(v: number, min: number, max: number): number {
  return Math.min(Math.max(min, Math.round(v / GRID_SIZE) * GRID_SIZE), max);
}

/**
 * Fit an image's natural aspect ratio into the work-area box, preserving the ratio.
 *
 * Pure so it can be tested without a DOM — the bug it exists to prevent (a figure sized past the
 * right or bottom margin) is a decision about which dimension gives way, not arithmetic nobody
 * would get wrong.
 *
 * The width gives way, not the height: letterboxing inside `object-fit: contain` would leave the
 * block claiming space it is not using, and a figure whose box no longer matches its image is the
 * harder thing to notice on a printed sheet.
 */
export function fitFigureBox(o: {
  naturalW: number;
  naturalH: number;
  curW: number;
  chromeH: number;
  maxW: number;
  maxH: number;
}): { w: number; h: number } {
  const aspect = o.naturalW / o.naturalH;
  let w = Math.min(o.curW, o.maxW);
  let imgH = w / aspect;
  const availImgH = o.maxH - o.chromeH;
  if (availImgH > GRID_SIZE && imgH > availImgH) {
    imgH = availImgH;
    w = imgH * aspect;
  }
  return {
    w: snapWithin(w, MIN_W, o.maxW),
    h: snapWithin(Math.max(GRID_SIZE * 2, imgH) + o.chromeH, MIN_H, o.maxH),
  };
}

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
  // Capped on the way in as well as on edit, because a sheet saved before this clamp existed holds
  // an out-of-bounds `block.w`/`block.h` and would otherwise keep printing off the page forever.
  //
  // The RENDERED box is clamped; `block.w`/`block.h` are deliberately left alone. Rewriting them
  // here would change `projectFingerprint()` during load, so merely opening an old sheet would
  // report unsaved changes. The stored values are corrected the first time the figure is resized
  // or its image reloaded, and until then the clamp keeps the block inside the work area — which is
  // what `markPageOverflow` measures, so the orange outline clears too.
  //
  // `figureMaxBox` reads only `el.style.left`/`top` and module constants for a canvas block, both
  // of which `Canvas.addBlock` sets before calling this builder. A section child returns Infinity
  // here (its host cannot be measured before the element is in the DOM), so `Math.min` is a no-op
  // and the child keeps its stored size.
  const initBox = figureMaxBox(el, block);
  el.style.width = `${Math.min(block.w ?? DEFAULT_W, initBox.w)}px`;
  el.style.height = `${Math.min(block.h ?? DEFAULT_H, initBox.h)}px`;

  let data: FigureData;
  // Set when block.content could not be parsed — see the catch below.
  let corrupt = false;
  try {
    data = JSON.parse(block.content || '{}') as FigureData;
  } catch {
    // The image and caption could not be read. The empty object below is only so the block can
    // render — DO NOT let it be written back: every edit here calls syncContent, which would
    // overwrite the original (possibly recoverable) content with the blank reconstruction.
    console.error('Figure block content could not be parsed; leaving it untouched.', block.id);
    data = { src: '', caption: '' };
    corrupt = true;
  }

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
    corrupt = false; // the user supplied new content — this block is now well-formed again
    block.content = JSON.stringify(data);
    img.src = src;
    img.style.display = '';
    placeholder.style.display = 'none';
    const applyAspect = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const box = figureMaxBox(el, block);
      const fit = fitFigureBox({
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        curW: block.w ?? el.offsetWidth ?? DEFAULT_W,
        chromeH: header.offsetHeight + caption.offsetHeight,
        maxW: box.w,
        maxH: box.h,
      });
      block.w = fit.w;
      block.h = fit.h;
      el.style.width = `${block.w}px`;
      el.style.height = `${block.h}px`;
      // The new height may have changed which page the bottom edge lands on.
      onUpdatePageCount?.();
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
  /**
   * Open the file picker.
   *
   * ⚠️ `value` is cleared first, or **choosing the same file twice fires no `change` event** and
   * the reload silently does nothing — which is exactly the "I edited that image, load it again"
   * case this is for (Jon, 2026-10-06).
   */
  function pickImage() {
    fileInput.value = '';
    fileInput.click();
  }

  /** Empty the figure, leaving the block and its caption in place. */
  function clearSrc() {
    data.src = '';
    img.removeAttribute('src');
    img.style.display = 'none';
    placeholder.style.display = '';
    // Same rule as the caption's blur: never write the blank reconstruction over content that
    // only failed to PARSE, which may still be recoverable by hand.
    if (!corrupt) block.content = JSON.stringify(data);
  }

  placeholder.addEventListener('click', pickImage);

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
    // Never write the blank reconstruction over unparseable content — clicking into the caption
    // and out again would have silently destroyed the stored image. Choosing a new image
    // (loadSrc) still writes, because that is the user deliberately replacing the content.
    if (corrupt) return;
    block.content = JSON.stringify(data);
  });
  el.appendChild(caption);
  el.appendChild(fileInput);

  // Replacing and removing the image live on the right-click menu, which already carries the
  // per-block actions and which long-press reaches on touch — rather than as buttons floating
  // over the figure, where they would sit in the same strip the resize handle covers (§ 29).
  // deno-lint-ignore no-explicit-any
  (el as any)._figureCtxActions = {
    hasImage: () => !!data.src,
    replaceImage: pickImage,
    removeImage: clearSrc,
  };

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
    // Measured once at pointerdown: the block does not move during a width drag, so the right
    // margin it must stay inside does not move either. Same clamp the plot block uses.
    const maxW = figureMaxBox(el, block).w;
    const onMove = (mv: PointerEvent) => {
      const newW = snapWithin(startW + (mv.clientX - startX), MIN_W, maxW);
      block.w = newW;
      el.style.width = `${newW}px`;
    };
    const onUp = () => {
      rightHandle.removeEventListener('pointermove', onMove);
      rightHandle.removeEventListener('pointerup', onUp);
      rightHandle.removeEventListener('pointercancel', onUp);
      rightHandle.classList.remove('handle-active');
      document.body.style.cursor = '';
      onUpdatePageCount?.();
    };
    rightHandle.addEventListener('pointermove', onMove);
    rightHandle.addEventListener('pointerup', onUp);
    rightHandle.addEventListener('pointercancel', onUp);
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
    // The bottom margin of the page this figure sits on. Dragging past it is what put figures
    // across a page break, where print cut them in half.
    const maxH = figureMaxBox(el, block).h;
    const onMove = (mv: PointerEvent) => {
      const newH = snapWithin(startH + (mv.clientY - startY), MIN_H, maxH);
      block.h = newH;
      el.style.height = `${newH}px`;
    };
    const onUp = () => {
      bottomHandle.removeEventListener('pointermove', onMove);
      bottomHandle.removeEventListener('pointerup', onUp);
      bottomHandle.removeEventListener('pointercancel', onUp);
      bottomHandle.classList.remove('handle-active');
      document.body.style.cursor = '';
      onUpdatePageCount?.();
    };
    bottomHandle.addEventListener('pointermove', onMove);
    bottomHandle.addEventListener('pointerup', onUp);
    bottomHandle.addEventListener('pointercancel', onUp);
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
