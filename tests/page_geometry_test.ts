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
  lastGridColumn,
  lastGridLine,
  margins,
  PAGE_H,
  pageContentTop,
  pageIndexOf,
  pageWorkArea,
  setTitleBlockEnabled,
  setTitleBlockMeasuredH,
  snapToPageGrid,
  titleBlockH,
} from '../src/state.ts';
import { GRID_SIZE, TITLE_BLOCK_H } from '../src/types.ts';
import { CANVAS_W } from '../src/state.ts';

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

      // The origin IS the first line, so every line is an exact multiple of GRID_SIZE from it.
      assertEquals(first, area.top, `page ${page}: grid must start at the work-area top`);
      assertEquals((last - first) % GRID_SIZE, 0, `page ${page}: last line off-grid`);
      assertEquals(last <= area.bottom, true, `page ${page}: last line past the bottom margin`);
      // No slack: one more line would leave the band.
      assertEquals(last + GRID_SIZE > area.bottom, true, `page ${page}: last line too high`);
    }
  });

  await t.step('the grid starts AT the work-area top, below the title block', () => {
    // Jon, 2026-10-02: "the grid guides should always be below the title block area." Anchoring the
    // origin there makes the first line and the first usable position the same number by
    // construction. Drawn from margins.top instead, the lines were painted behind the title block
    // and — since TITLE_BLOCK_H (112) is not a grid multiple — the usable top (136) never landed on
    // one (…124, 144…). That mismatch was the root of every "off by 8 px".
    assertEquals(TITLE_BLOCK_H % GRID_SIZE !== 0, true);
    for (const tb of [false, true]) {
      setTitleBlockEnabled(tb);
      for (const page of [0, 1, 3]) {
        assertEquals(firstGridLine(page), pageWorkArea(page).top, `page ${page}, tb=${tb}`);
      }
    }
    setTitleBlockEnabled(true);
    assertEquals(firstGridLine(0), margins.top + TITLE_BLOCK_H);
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

  await t.step(
    'a top past the last line is clamped to it, NOT moved to another page',
    () => {
      // v2.6.7 sent an over-run to the next page's first line, copying moveGridCursor. Right for a
      // cursor the user is watching; wrong here, because snapToPageGrid is also the REPOSITION
      // path. A block dropped low on the last page was sent to a page that did not exist yet, and
      // updateMarginGuide's `CANVAS_H - offsetHeight` clamp then parked it at the bottom of the
      // canvas, off the lines — reported 2026-10-02 as always landing at the lower-left corner.
      // **Snapping must never relocate a block.** Only the cursor advances pages.
      setTitleBlockEnabled(false);
      const last = lastGridLine(0);
      assertEquals(snapToPageGrid(last), last); // on the last line: stays
      assertEquals(snapToPageGrid(last + GRID_SIZE), last); // past it: clamped back
      assertEquals(snapToPageGrid(PAGE_H - 2), last); // in the unlined strip: still page 0
      // The page of the RESULT must be the page it was asked about, in both directions.
      assertEquals(pageIndexOf(snapToPageGrid(PAGE_H - 2)), 0);
      assertEquals(pageIndexOf(snapToPageGrid(PAGE_H + margins.top + 100)), 1);
    },
  );

  await t.step('the lined BOX is the bottom bound, and it is below the last line', () => {
    // Two different kinds of bound, conflated in v2.6.4: a grid LINE is where a block's TOP may
    // sit; the lined box extends past the final line and content may fill to it.
    setTitleBlockEnabled(false);
    const area = pageWorkArea(0);
    assertEquals(area.bottom > lastGridLine(0), true);
    assertEquals(area.bottom, PAGE_H - margins.bottom);
    // And that box bottom is exactly the guide canvas.ts draws: margins.top + guideH.
    assertEquals(area.bottom, margins.top + (PAGE_H - margins.top - margins.bottom));
  });

  await t.step('a title block that GROWS moves the work area down with it', () => {
    // TITLE_BLOCK_H is the empty case. The overlay sizes to its content and a wrapped SUBJECT line
    // makes it taller — the CSS cannot prevent that, because a table's `height` is a minimum and
    // `max-height` on a `<tr>` is ignored. Every page bound derives from titleBlockH(), so the
    // measurement has to reach it or blocks are placed under the part nobody counted
    // (reported with screenshots 2026-10-02).
    setTitleBlockEnabled(true);
    const nominal = pageWorkArea(0);
    assertEquals(nominal.top, margins.top + TITLE_BLOCK_H);

    const grown = TITLE_BLOCK_H + 40; // one wrapped line and a spare row
    assertEquals(setTitleBlockMeasuredH(grown), true, 'a new height must report as changed');
    assertEquals(setTitleBlockMeasuredH(grown), false, 'the same height must not reflow');

    const after = pageWorkArea(0);
    assertEquals(after.top, margins.top + grown);
    assertEquals(after.height, nominal.height - 40); // taller block, shorter work area
    assertEquals(after.bottom, nominal.bottom); // the bottom margin is unaffected
    assertEquals(firstGridLine(0), after.top); // and the grid still starts at the work-area top
    // Every page moves by the same amount, so a continuation on page 3 lines up with one on page 1.
    assertEquals(pageWorkArea(2).top, 2 * PAGE_H + margins.top + grown);

    // Switched OFF, the grid area grows back to the top margin whatever the measurement was.
    setTitleBlockEnabled(false);
    assertEquals(pageWorkArea(0).top, margins.top);
    assertEquals(titleBlockH(), 0);

    setTitleBlockEnabled(true);
    setTitleBlockMeasuredH(TITLE_BLOCK_H);
  });

  await t.step('every placement path lands on an intersection, not a half-square', () => {
    // Reported 2026-10-02: "we are snapping to the midpoint of a gridline now instead of a grid
    // intersection." addBlock snapped and updateMarginGuide did not, so the two disagreed by
    // (gridOrigin − margins.top) mod GRID_SIZE — zero while the origin was margins.top, and
    // arbitrary once it became the work-area top with a MEASURED title block in it.
    //
    // The same offset caused the second half of that report: the split sized the kept part against
    // the block's position at computation time, then the reposition moved it down underneath,
    // so the part made to fit no longer did. One offset, two symptoms — which is why this asserts
    // the agreement rather than either path on its own.
    setTitleBlockEnabled(true);
    setTitleBlockMeasuredH(TITLE_BLOCK_H + 10); // a height that is NOT a whole number of squares
    try {
      for (const page of [0, 1, 2]) {
        const origin = firstGridLine(page);
        // What updateMarginGuide replays: an absolute top rebuilt from the stored y.
        for (const offset of [0, 13, 27, 200, 405]) {
          const replayed = snapToPageGrid(origin + offset);
          assertEquals(
            (replayed - origin) % GRID_SIZE,
            0,
            `page ${page}, offset ${offset}: landed off the intersections`,
          );
          assertEquals(replayed >= origin, true, `page ${page}: above the first line`);
        }
        // Idempotent — replaying a stored position must not drift it further each reflow.
        const once = snapToPageGrid(origin + 33);
        assertEquals(snapToPageGrid(once), once, `page ${page}: snapping is not idempotent`);
      }
    } finally {
      setTitleBlockMeasuredH(TITLE_BLOCK_H);
    }
  });

  await t.step('pageIndexOf never returns a negative page', () => {
    // A drag above the canvas gives a negative y; a negative page index would index the geometry
    // backwards and compute a floor above the canvas.
    assertEquals(pageIndexOf(-500), 0);
    assertEquals(pageIndexOf(0), 0);
  });

  // A size bound has to land on a line, not on the margin. v2.11.1 capped a resize at the raw
  // margin, and because the snapping blocks round their size to GRID_SIZE, the cap then won over
  // the snap and the edge landed BETWEEN lines — reported as "figures snapping to the midpoint of
  // the grid lines instead of the intersections" (Jon, 2026-10-07).
  await t.step('the raw bottom margin is NOT on a grid line — which is the whole problem', () => {
    setTitleBlockEnabled(false);
    const area = pageWorkArea(0);
    assertEquals((area.bottom - firstGridLine(0)) % GRID_SIZE !== 0, true);
  });

  await t.step('lastGridLine is on the grid and at or above the bottom margin', () => {
    setTitleBlockEnabled(false);
    for (const pi of [0, 1, 2]) {
      const line = lastGridLine(pi);
      assertEquals((line - firstGridLine(pi)) % GRID_SIZE, 0);
      assertEquals(line <= pageWorkArea(pi).bottom, true);
      assertEquals(pageWorkArea(pi).bottom - line < GRID_SIZE, true);
    }
  });

  await t.step('and still on the grid with a title block, where the gap is bigger', () => {
    setTitleBlockEnabled(true);
    setTitleBlockMeasuredH(TITLE_BLOCK_H);
    for (const pi of [0, 1]) {
      const line = lastGridLine(pi);
      assertEquals((line - firstGridLine(pi)) % GRID_SIZE, 0);
      assertEquals(line <= pageWorkArea(pi).bottom, true);
    }
    setTitleBlockEnabled(false);
  });

  await t.step('lastGridColumn is on the grid and at or left of the right margin', () => {
    const col = lastGridColumn();
    assertEquals((col - margins.left) % GRID_SIZE, 0);
    assertEquals(col <= CANVAS_W - margins.right, true);
    assertEquals(CANVAS_W - margins.right - col < GRID_SIZE, true);
  });

  // Leave the module-level flag as the suite found it — state.ts is a shared singleton and a test
  // that leaves it enabled changes what every later test sees.
  setTitleBlockEnabled(false);
});
