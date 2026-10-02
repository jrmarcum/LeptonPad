// ---------------------------------------------------------------------------
// Page geometry — a block must never share space with a title block
// ---------------------------------------------------------------------------
// A title block overlay is drawn at the top of EVERY page with `z-index: 2`, so a block that
// overlaps one is hidden behind it. Reported 2026-10-02 as "blocks are getting hidden behind the
// title block on open".
//
// Four places computed where a block may sit and they disagreed: the keyboard grid cursor was
// per-page and correct, `placeBlock` had no guard at all, `addBlock` had none AND dropped the
// titleBlockH that a section's stored `y` excludes, and `updateMarginGuide` floored page 1 only.
// They now share `clearTitleBlock`, which is what this pins.

import { assertEquals } from '@std/assert';
import {
  clearTitleBlock,
  firstGridLine,
  lastGridLine,
  margins,
  PAGE_H,
  pageContentTop,
  pageIndexOf,
  pageWorkArea,
  setTitleBlockEnabled,
  snapToPageGrid,
  titleBlockH,
} from '../src/state.ts';
import { GRID_SIZE, TITLE_BLOCK_H } from '../src/types.ts';

Deno.test('page geometry and the title block', async (t) => {
  await t.step('with no title block, nothing is pushed anywhere', () => {
    setTitleBlockEnabled(false);
    assertEquals(titleBlockH(), 0);
    const top = margins.top;
    assertEquals(clearTitleBlock(top), top);
    assertEquals(pageContentTop(0), margins.top);
  });

  await t.step('a block inside the title block is pushed below it', () => {
    setTitleBlockEnabled(true);
    assertEquals(titleBlockH(), TITLE_BLOCK_H);
    const floor = margins.top + TITLE_BLOCK_H;
    // At the very top of the content area — squarely inside the title block.
    assertEquals(clearTitleBlock(margins.top), floor);
    // Part-way in.
    assertEquals(clearTitleBlock(margins.top + 40), floor);
    // Already clear: left exactly alone, not snapped or nudged.
    assertEquals(clearTitleBlock(floor + 20), floor + 20);
  });

  await t.step('the floor applies PER PAGE, not only to page 1', () => {
    // This is the half that was missing: `margins.top + tbH` as a single global floor leaves a
    // block near the top of page 2 or 3 sitting behind that page's own title block.
    setTitleBlockEnabled(true);
    for (const page of [1, 2, 5]) {
      const pageTop = page * PAGE_H + margins.top;
      assertEquals(pageIndexOf(pageTop), page);
      assertEquals(pageContentTop(page), pageTop + TITLE_BLOCK_H);
      assertEquals(clearTitleBlock(pageTop), pageTop + TITLE_BLOCK_H);
      assertEquals(clearTitleBlock(pageTop + 10), pageTop + TITLE_BLOCK_H);
      // Mid-page on the same page is untouched.
      assertEquals(clearTitleBlock(pageTop + 400), pageTop + 400);
    }
  });

  await t.step('the work area is bounded by BOTH margins and the title block', () => {
    // "the margins and the title block space as part of the active work area" — the thing each
    // open-coded copy of this remembered a different subset of (reported 2026-10-02).
    setTitleBlockEnabled(false);
    const plain = pageWorkArea(0);
    assertEquals(plain.top, margins.top);
    assertEquals(plain.bottom, PAGE_H - margins.bottom);
    assertEquals(plain.height, PAGE_H - margins.bottom - margins.top);

    setTitleBlockEnabled(true);
    const withTb = pageWorkArea(0);
    assertEquals(withTb.top, margins.top + TITLE_BLOCK_H);
    assertEquals(withTb.bottom, plain.bottom); // the title block costs height at the TOP only
    assertEquals(withTb.height, plain.height - TITLE_BLOCK_H);
  });

  await t.step('every page has the same work area, offset by its own page', () => {
    setTitleBlockEnabled(true);
    const first = pageWorkArea(0);
    for (const page of [1, 3]) {
      const w = pageWorkArea(page);
      assertEquals(w.top, first.top + page * PAGE_H);
      assertEquals(w.bottom, first.bottom + page * PAGE_H);
      assertEquals(w.height, first.height);
    }
  });

  await t.step('grid lines bound the band, not the raw margins', () => {
    // "not respecting the boundary ... past the lined part of the page inside the bottom margin"
    // (2026-10-02). The margin is where the lined area stops being DRAWN; the last grid line is
    // where content can actually sit, and the gap between them is what a block was overrunning
    // into. Both bounds must be ON the grid, and inside the work area.
    setTitleBlockEnabled(true);
    for (const page of [0, 1, 4]) {
      const area = pageWorkArea(page);
      const first = firstGridLine(page);
      const last = lastGridLine(page);
      const origin = page * PAGE_H + margins.top;

      assertEquals((first - origin) % GRID_SIZE, 0, `page ${page} first line off-grid`);
      assertEquals((last - origin) % GRID_SIZE, 0, `page ${page} last line off-grid`);
      assertEquals(first >= area.top, true, `page ${page}: first line above the title block`);
      assertEquals(last <= area.bottom, true, `page ${page}: last line past the bottom margin`);
      // And no SLACK: one more line in either direction would leave the band.
      assertEquals(first - GRID_SIZE < area.top, true, `page ${page}: first line too low`);
      assertEquals(last + GRID_SIZE > area.bottom, true, `page ${page}: last line too high`);
    }
  });

  await t.step('TITLE_BLOCK_H is not a grid multiple — which is why this is needed', () => {
    // 112 against a 20 px grid. Placing a continuation at `margin + titleBlockH` put it 8 px off
    // the lines every time; firstGridLine is what makes it land on one.
    assertEquals(TITLE_BLOCK_H % GRID_SIZE !== 0, true);
    setTitleBlockEnabled(true);
    assertEquals(firstGridLine(0), margins.top + Math.ceil(TITLE_BLOCK_H / GRID_SIZE) * GRID_SIZE);
  });

  await t.step('snapping is per page, because PAGE_H is not a grid multiple either', () => {
    // US Letter is 1056 px against a 20 px grid. Snapping against the canvas as a whole lands
    // between the lines of any page but the first, and drifts further down the document.
    assertEquals(PAGE_H % GRID_SIZE !== 0, true);
    setTitleBlockEnabled(false);
    for (const page of [0, 1, 3]) {
      const origin = page * PAGE_H + margins.top;
      const snapped = snapToPageGrid(origin + GRID_SIZE * 3 + 7);
      assertEquals((snapped - origin) % GRID_SIZE, 0, `page ${page} snap off-grid`);
    }
    // Never above the page's first usable line, even when asked for something higher.
    setTitleBlockEnabled(true);
    assertEquals(snapToPageGrid(PAGE_H + margins.top) >= firstGridLine(1), true);
  });

  await t.step('pageIndexOf never returns a negative page', () => {
    // A drag above the canvas gives a negative y; a negative page index would index the geometry
    // backwards and compute a floor above the canvas.
    assertEquals(pageIndexOf(-500), 0);
    assertEquals(pageIndexOf(0), 0);
  });

  // Leave the module-level flag as the suite found it — state.ts is a shared singleton and a test
  // that leaves it enabled changes what every later test sees.
  setTitleBlockEnabled(false);
});
