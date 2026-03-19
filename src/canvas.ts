// ---------------------------------------------------------------------------
// Canvas — the main drawing surface managing block layout and DOM structure
// ---------------------------------------------------------------------------

import { type Block, GRID_SIZE } from './types.ts';
import {
  CANVAS_W, CANVAS_H, PAGE_H, margins, titleBlockH,
  state, childToSection, selectedEls, setMultiDragState,
  onSelectBlock, onAddToSelection,
} from './state.ts';
import { clamp } from './utils/units.ts';
import { buildSectionBlock } from './blocks/section.ts';
import { buildPlotBlock } from './blocks/plot.ts';
import { buildFormulaBlock } from './blocks/formula.ts';
import { buildSectPropBlock } from './blocks/sect-prop.ts';
import { buildBeamDefBlock } from './blocks/beam-def.ts';
import { buildTextBlock } from './blocks/text.ts';
import { buildFigureBlock } from './blocks/figure.ts';

export class Canvas {
  private element: HTMLElement;
  private guide: HTMLElement;
  private cursor: HTMLElement;

  constructor(id: string) {
    this.element = document.getElementById(id)!;
    // Stamp the JS page dimensions onto the element so CSS never disagrees
    this.element.style.width  = `${CANVAS_W}px`;
    this.element.style.height = `${CANVAS_H}px`;
    this.element.addEventListener('dragover', (e) => e.preventDefault());
    this.guide = document.createElement('div');
    this.guide.id = 'margin-guide';
    this.guide.classList.add('engineering-grid');
    this.element.appendChild(this.guide);
    this.cursor = document.getElementById('grid-cursor') as HTMLElement;
    // SVG crosshair: 10x10 viewport, lines centered at (5,5); offset -5px so center aligns with grid point
    this.cursor.innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"` +
      ` style="position:absolute;top:-5px;left:-5px;display:block">` +
      `<line x1="0" y1="5" x2="10" y2="5" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>` +
      `<line x1="5" y1="0" x2="5" y2="10" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>` +
      `</svg>`;
    this.updateMarginGuide();
  }

  public moveGhost(canvasX: number, canvasY: number) {
    // Use transform to move cursor — avoids any conflict with CSS left/top
    this.cursor.style.transform = `translate(${canvasX}px, ${canvasY}px)`;
  }

  public get domElement(): HTMLElement {
    return this.element;
  }

  public snap(value: number): number {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  public updateMarginGuide() {
    const guideH = PAGE_H - margins.top - margins.bottom;
    // Page 1 guide (#margin-guide)
    this.guide.style.top    = `${margins.top}px`;
    this.guide.style.left   = `${margins.left}px`;
    this.guide.style.right  = `${margins.right}px`;
    this.guide.style.height = `${guideH}px`;
    this.guide.style.bottom = 'auto';
    // background-origin: border-box (set in CSS) means position 0 0 starts at the outer
    // edge of the guide (= margins.left / margins.top), so grid lines land on snap positions.
    this.guide.style.backgroundPosition = '0 0';
    // Page number position tracks both margins (bottom margin sets vertical, right margin sets horizontal)
    this.element.querySelectorAll<HTMLElement>('.page-num').forEach((pn, i) => {
      pn.style.top   = `${(i + 1) * PAGE_H - margins.bottom}px`;
      pn.style.right = `${margins.right}px`;
    });
    // Per-page guides for pages 2+ (created by syncPageSeparators)
    this.element.querySelectorAll<HTMLElement>('.page-guide').forEach((g, i) => {
      const pageIdx = i + 1;
      g.style.top    = `${pageIdx * PAGE_H + margins.top}px`;
      g.style.left   = `${margins.left}px`;
      g.style.right  = `${margins.right}px`;
      g.style.height = `${guideH}px`;
      g.style.bottom = 'auto';
      g.style.backgroundPosition = '0 0';
    });
    // Reposition blocks to keep them at their margin-relative coordinates
    // (skip child blocks — they are positioned relative to their section content area)
    this.element.querySelectorAll<HTMLElement>('.block').forEach((el) => {
      if (childToSection.has(el.id)) return;
      const block = state.blocks.find((b) => b.id === el.id);
      if (!block) return;
      if (block.type === 'section') {
        // Full-width blocks locked to margin-to-margin
        block.x = 0;
        el.style.left = `${margins.left}px`;
        el.style.top  = `${clamp(margins.top + titleBlockH() + block.y, margins.top + titleBlockH(), CANVAS_H - el.offsetHeight)}px`;
        el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
        el.style.maxWidth = '';
        return;
      }
      const tbH = titleBlockH();
      const absLeft = clamp(margins.left + block.x, margins.left, CANVAS_W - margins.right - el.offsetWidth);
      // block.y is stored as (newTop - margins.top), so restore without adding tbH again
      const absTop  = clamp(margins.top + block.y, margins.top + tbH, CANVAS_H - el.offsetHeight);
      el.style.left = `${absLeft}px`;
      el.style.top  = `${absTop}px`;
      el.style.maxWidth = `${CANVAS_W - margins.right - absLeft}px`;
    });
    // Reposition title block overlays for each page
    this.element.querySelectorAll<HTMLElement>('.title-block-overlay').forEach((el, i) => {
      el.style.left  = `${margins.left}px`;
      el.style.top   = `${i * PAGE_H + margins.top}px`;
      el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
    });
  }

  public addBlock(block: Block) {
    const el = document.createElement('div');
    el.id = block.id;
    el.className = 'block';

    // Child blocks are positioned relative to section content — skip margin offset
    if (!block.parentSectionId) {
      // Snap in margin-relative coords so blocks align with the margin-offset grid
      const initLeft = margins.left + this.snap(block.x);
      el.style.left = `${initLeft}px`;
      el.style.top  = `${margins.top + this.snap(block.y)}px`;
      el.style.maxWidth = `${CANVAS_W - margins.right - initLeft}px`;
    } else {
      el.style.left = `${this.snap(block.x)}px`;
      el.style.top  = `${this.snap(block.y)}px`;
    }

    if (block.type === 'section') {
      // Full-width blocks: locked to left margin, spanning the usable page width
      block.x = 0;
      const sectionW = CANVAS_W - margins.left - margins.right;
      el.style.left = `${margins.left}px`;
      el.style.width = `${sectionW}px`;
      el.style.maxWidth = '';
      buildSectionBlock(el, block);
    } else if (block.type === 'plot') {
      buildPlotBlock(el, block);
    } else if (block.type === 'header') {
      const h2 = document.createElement('h2');
      h2.contentEditable = 'true';
      h2.textContent = block.content || '';
      h2.dataset.placeholder = 'Heading…';
      h2.addEventListener('blur', () => { block.content = h2.textContent ?? ''; });
      el.appendChild(h2);
    } else if (block.type === 'formula') {
      buildFormulaBlock(el, block);
    } else if (block.type === 'math' && block.subtype === 'sect-prop') {
      buildSectPropBlock(el);
    } else if (block.type === 'math' && block.subtype === 'beam-def') {
      buildBeamDefBlock(el, state.constants.E ?? 200000);
    } else if (block.type === 'summary') {
      buildFormulaBlock(el, block);  // identical UI to formula block
      el.classList.add('summary-block');
    } else if (block.type === 'text') {
      buildTextBlock(el, block);
    } else if (block.type === 'figure') {
      buildFigureBlock(el, block);
    } else {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.className = 'block-text';
      div.textContent = block.content || '';
      div.dataset.placeholder = `New ${block.type} block`;
      div.addEventListener('blur', () => { block.content = div.textContent ?? ''; });
      el.appendChild(div);
    }

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return; // ignore right-click so contextmenu fires cleanly
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || (target as HTMLElement).isContentEditable) return;
      // Section blocks are dragged via their own header handler
      if (block.type === 'section') return;
      e.stopPropagation(); // prevent bubbling into a parent section's drag handler
      if (e.shiftKey) {
        onAddToSelection?.(el);
      } else if (!selectedEls.has(el)) {
        onSelectBlock?.(el);
      }
      // Start multi-drag: capture original positions for every selected block
      setMultiDragState({
        startX: e.clientX,
        startY: e.clientY,
        origPositions: new Map([...selectedEls].map((s) => [s, {
          left: parseInt(s.style.left),
          top: parseInt(s.style.top),
        }])),
      });
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    });

    // ── Long-press detection (touch only) ────────────────────────────────────
    // Edge zone long-press  → confirm block selection (drag-ready).
    // Interior long-press   → cancel drag state + fire contextmenu.
    const LONG_PRESS_MS = 500;
    const CANCEL_PX     = 8;   // finger movement threshold that aborts the timer
    const EDGE_PX       = 24;  // px from any border considered the "edge zone"
    let lpTimer: ReturnType<typeof setTimeout> | null = null;
    let lpStartX = 0, lpStartY = 0, lpId = -1;

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      lpStartX = e.clientX;
      lpStartY = e.clientY;
      lpId     = e.pointerId;
      if (lpTimer !== null) { clearTimeout(lpTimer); lpTimer = null; }
      lpTimer = setTimeout(() => {
        lpTimer = null;
        const rect   = el.getBoundingClientRect();
        const rx     = lpStartX - rect.left;
        const ry     = lpStartY - rect.top;
        const onEdge = rx < EDGE_PX || rx > rect.width  - EDGE_PX ||
                       ry < EDGE_PX || ry > rect.height - EDGE_PX;
        if (onEdge) {
          // Edge: ensure block is selected and ready to drag
          onSelectBlock?.(el);
        } else {
          // Interior: cancel any pending drag and open the context menu
          setMultiDragState(null);
          document.body.style.cursor = '';
          const hit = document.elementFromPoint(lpStartX, lpStartY) ?? el;
          hit.dispatchEvent(new MouseEvent('contextmenu', {
            bubbles: true, cancelable: true,
            clientX: lpStartX, clientY: lpStartY,
            view: window,
          }));
        }
      }, LONG_PRESS_MS);
    });

    const lpCancel = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || e.pointerId !== lpId || lpTimer === null) return;
      if (e.type === 'pointermove') {
        if (Math.hypot(e.clientX - lpStartX, e.clientY - lpStartY) > CANCEL_PX) {
          clearTimeout(lpTimer); lpTimer = null;
        }
      } else {
        clearTimeout(lpTimer); lpTimer = null;
      }
    };
    el.addEventListener('pointermove',   lpCancel);
    el.addEventListener('pointerup',     lpCancel);
    el.addEventListener('pointercancel', lpCancel);

    this.element.appendChild(el);
  }
}
