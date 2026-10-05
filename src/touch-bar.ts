// ---------------------------------------------------------------------------
// The cell accessory bar — row and cell commands for a device with no Ctrl or Alt
// ---------------------------------------------------------------------------
// A phone keyboard has no modifier keys, so every formula-cell command was unreachable there
// (Jon, 2026-10-05). The long-press context menu already covers the row operations; what it
// cannot give back is moving between cells while the keyboard is up, which on a phone covers
// most of the sheet.
//
// 🔑 **Every button dispatches the keystroke it stands for rather than calling the action.**
// The bar is a keyboard surrogate, not a second control surface: `+row` sends Ctrl+Enter to the
// focused cell and the existing handler in `formula.ts` does the work. Nothing here knows what a
// row is. That is deliberate — two copies of the same logic are usually wrong the same way, and
// this file would be the copy nobody remembers to update.
//
// Shown only on a coarse pointer, matching the `(hover: none) and (pointer: coarse)` rule the
// stylesheet already uses for touch grips. A desktop keyboard needs none of this.

/** Cells the bar applies to — the same three the Alt+Arrow handler in `formula.ts` navigates. */
const CELL_SEL = '.formula-cell, .formula-desc-cell, .formula-ref-cell';

interface BarButton {
  label: string;
  title: string;
  /** The keystroke this button stands for. */
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  /** Set on the spacer that only dismisses the keyboard. */
  blur?: boolean;
}

const BUTTONS: BarButton[] = [
  { label: '◀', title: 'Previous cell', key: 'ArrowLeft', alt: true },
  { label: '▲', title: 'Cell above', key: 'ArrowUp', alt: true },
  { label: '▼', title: 'Cell below', key: 'ArrowDown', alt: true },
  { label: '▶', title: 'Next cell', key: 'ArrowRight', alt: true },
  { label: '+ row', title: 'Insert a row below', key: 'Enter', ctrl: true },
  { label: '− row', title: 'Delete this row', key: '-', ctrl: true },
  { label: '↶', title: 'Undo the last deleted row', key: 'z', ctrl: true, shift: true },
  { label: '⌄', title: 'Hide the keyboard', key: '', blur: true },
];

export function initTouchCellBar(): void {
  if (!globalThis.matchMedia?.('(hover: none) and (pointer: coarse)').matches) return;

  const bar = document.createElement('div');
  bar.id = 'touch-cell-bar';
  bar.className = 'hidden';

  let activeCell: HTMLElement | null = null;

  for (const b of BUTTONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'touch-cell-btn';
    btn.textContent = b.label;
    btn.title = b.title;
    btn.setAttribute('aria-label', b.title);

    // ⚠️ The whole bar hangs on this. A button takes focus on pointerdown, which blurs the cell
    // and closes the keyboard — so the keystroke would arrive at nothing and the bar would hide
    // itself the instant it was touched. Refusing the default keeps focus in the cell.
    btn.addEventListener('pointerdown', (e) => e.preventDefault());
    btn.addEventListener('mousedown', (e) => e.preventDefault());

    btn.addEventListener('click', () => {
      const cell = activeCell;
      if (!cell) return;
      if (b.blur) {
        cell.blur();
        return;
      }
      cell.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: b.key,
          ctrlKey: !!b.ctrl,
          altKey: !!b.alt,
          shiftKey: !!b.shift,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    bar.appendChild(btn);
  }

  document.body.appendChild(bar);

  /**
   * Sit the bar on top of the soft keyboard.
   *
   * The keyboard shrinks the VISUAL viewport without changing the layout viewport, so the gap
   * between them is exactly the keyboard's height. Without this the bar would sit at the bottom
   * of the layout viewport, underneath the keyboard, which is the usual way this pattern fails.
   */
  const place = () => {
    const vv = globalThis.visualViewport;
    if (!vv) {
      bar.style.bottom = '0px';
      return;
    }
    const gap = globalThis.innerHeight - (vv.height + vv.offsetTop);
    bar.style.bottom = `${Math.max(0, Math.round(gap))}px`;
  };

  globalThis.visualViewport?.addEventListener('resize', place);
  globalThis.visualViewport?.addEventListener('scroll', place);

  document.addEventListener('focusin', (e) => {
    const cell = (e.target as HTMLElement)?.closest<HTMLElement>?.(CELL_SEL) ?? null;
    if (!cell) return;
    activeCell = cell;
    bar.classList.remove('hidden');
    place();
  });

  document.addEventListener('focusout', (e) => {
    // Deferred by a tick: moving between cells fires focusout before the next focusin, and
    // hiding immediately would flash the bar off and on with every arrow press.
    const from = (e.target as HTMLElement)?.closest<HTMLElement>?.(CELL_SEL) ?? null;
    if (!from) return;
    setTimeout(() => {
      const still = document.activeElement?.closest<HTMLElement>?.(CELL_SEL) ?? null;
      if (still) {
        activeCell = still;
        place();
        return;
      }
      activeCell = null;
      bar.classList.add('hidden');
    }, 0);
  });
}
