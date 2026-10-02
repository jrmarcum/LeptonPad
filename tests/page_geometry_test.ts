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
  margins,
  PAGE_H,
  pageContentTop,
  pageIndexOf,
  pageWorkArea,
  setTitleBlockEnabled,
  titleBlockH,
} from '../src/state.ts';
import { TITLE_BLOCK_H } from '../src/types.ts';

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
