// ---------------------------------------------------------------------------
// A figure stays inside the work area
// ---------------------------------------------------------------------------
// Every other block is capped by `maxWidth` in canvas.ts; a figure sets an inline `width` instead,
// and both of its resize handles wrote `block.w`/`block.h` with a lower bound and no upper one. So
// a wide image ran past the right margin and a tall one past the bottom margin, the overrun was
// stored rather than merely rendered, and on paper the browser cut the canvas at the sheet boundary
// — graphics shifted off the page, and the orange page-overflow outline appeared on figures that
// offer no split (Jon, 2026-10-07).
//
// `fitFigureBox` is the decision: when the aspect ratio will not fit, which dimension gives way.
// The width does, so the block never claims space the image is not filling.

import { assertEquals } from '@std/assert';
import { fitFigureBox, snapWithin } from '../src/blocks/figure.ts';
import { GRID_SIZE } from '../src/types.ts';

const MIN_W = 80;
const MIN_H = GRID_SIZE * 3;
const CHROME = 40; // label + caption, as measured on screen

Deno.test('a figure is fitted into the work area', async (t) => {
  await t.step('a width that fits is left alone', () => {
    const r = fitFigureBox({
      naturalW: 400,
      naturalH: 300,
      curW: 240,
      chromeH: CHROME,
      maxW: 600,
      maxH: 900,
    });
    assertEquals(r.w, 240);
    assertEquals(r.h, 180 + CHROME); // 240 / (4/3) = 180
  });

  await t.step('a width past the right margin is capped to it', () => {
    const r = fitFigureBox({
      naturalW: 400,
      naturalH: 300,
      curW: 5000,
      chromeH: CHROME,
      maxW: 600,
      maxH: 9000,
    });
    assertEquals(r.w, 600);
    assertEquals(r.h <= 9000, true);
  });

  await t.step('a height past the bottom margin shrinks the WIDTH, keeping the ratio', () => {
    // 4:3 image, 300px of usable height after chrome -> width must come down to ~400, not stay 1200
    const maxH = 300 + CHROME;
    const r = fitFigureBox({
      naturalW: 400,
      naturalH: 300,
      curW: 1200,
      chromeH: CHROME,
      maxW: 2000,
      maxH,
    });
    assertEquals(r.h <= maxH, true);
    assertEquals(r.w, 400);
    // ratio preserved to within one grid square of snapping
    const imgH = r.h - CHROME;
    assertEquals(Math.abs(r.w / imgH - 400 / 300) < 0.2, true);
  });

  await t.step('both bounds at once — neither is exceeded', () => {
    const r = fitFigureBox({
      naturalW: 1600,
      naturalH: 200,
      curW: 4000,
      chromeH: CHROME,
      maxW: 500,
      maxH: 200,
    });
    assertEquals(r.w <= 500, true);
    assertEquals(r.h <= 200, true);
  });

  await t.step('a very tall image still respects the minimum width', () => {
    const r = fitFigureBox({
      naturalW: 10,
      naturalH: 4000,
      curW: 240,
      chromeH: CHROME,
      maxW: 600,
      maxH: 100 + CHROME,
    });
    assertEquals(r.w >= MIN_W, true);
    assertEquals(r.h >= MIN_H, true);
  });

  await t.step('results land on the grid', () => {
    const r = fitFigureBox({
      naturalW: 777,
      naturalH: 391,
      curW: 453,
      chromeH: 37,
      maxW: 1000,
      maxH: 1000,
    });
    assertEquals(r.w % GRID_SIZE, 0);
  });

  await t.step('a tiny box cannot produce a negative or zero size', () => {
    const r = fitFigureBox({
      naturalW: 400,
      naturalH: 300,
      curW: 240,
      chromeH: 200,
      maxW: 100,
      maxH: 60,
    });
    assertEquals(r.w > 0, true);
    assertEquals(r.h > 0, true);
  });
});

Deno.test('snapWithin never rounds back across the cap', async (t) => {
  await t.step('rounding up would exceed max, so the cap wins', () => {
    // 591 snaps to 600, which is past a 595 cap — the cap has to be applied after the snap.
    assertEquals(snapWithin(591, 80, 595), 595);
  });

  await t.step('the floor wins over a smaller value', () => {
    assertEquals(snapWithin(10, 80, 600), 80);
  });

  await t.step('an exact grid multiple inside the bounds is unchanged', () => {
    assertEquals(snapWithin(300, 80, 600), 300);
  });

  await t.step('an infinite cap leaves the snap alone', () => {
    assertEquals(snapWithin(291, 80, Infinity), 300);
  });
});
