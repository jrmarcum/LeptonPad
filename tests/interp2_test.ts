// ---------------------------------------------------------------------------
// interp2 — bilinear lookup into a published two-way table
// ---------------------------------------------------------------------------
// The fixture is a real one: the Cdx coefficient table Jon supplied on 2026-10-02. It exercises
// everything awkward about printed engineering tables at once — rows DESCENDING (4.0 → 0.5),
// columns ASCENDING (0 → 0.5), a zero column at the end, and a folded x axis where the headings
// read "0.1b / 0.9b". That is why it is the fixture rather than a tidy invented grid.

import { assertAlmostEquals, assertMatch } from '@std/assert';
import { evalFormulaRows, type FormulaRow } from '../src/expr.ts';

/** b/a down the rows, x/b across the columns. Transcribed in the source document's own order. */
const TABLE = [
  'ba = {4.0, 3.0, 2.5, 2.0, 1.75, 1.5, 1.25, 1.0, 0.75, 0.5}',
  'xb = {{0, 0.1, 0.2, 0.3, 0.4, 0.5}}',
  'Cdx = {{0, 2.60, 6.20, 8.70, 10.10, 10.50},' +
  ' {0, 1.60, 4.20, 6.40, 7.70, 8.10},' +
  ' {0, 1.10, 3.10, 4.80, 6.00, 6.30},' +
  ' {0, 0.70, 2.00, 3.20, 4.00, 4.30},' +
  ' {0, 0.50, 1.50, 2.40, 3.00, 3.20},' +
  ' {0, 0.40, 1.00, 1.70, 2.10, 2.30},' +
  ' {0, 0.20, 0.60, 1.10, 1.40, 1.50},' +
  ' {0, 0.10, 0.30, 0.60, 0.70, 0.80},' +
  ' {0, 0.00, 0.10, 0.20, 0.30, 0.30},' +
  ' {0, 0.00, 0.00, 0.00, 0.00, 0.00}}',
];

function run(extra: string[]) {
  const rows = [...TABLE, ...extra].map((e): FormulaRow => ({ e, d: '' }));
  return evalFormulaRows(rows, {}, {});
}
const last = (extra: string[]) => run(extra)[TABLE.length + extra.length - 1];

Deno.test('interp2 on the Cdx table', async (t) => {
  await t.step('an exact grid point returns that cell', () => {
    assertAlmostEquals(last(['c = interp2(Cdx, ba, xb, 1.75, 0.3)']).value, 2.40, 1e-9);
    assertAlmostEquals(last(['c = interp2(Cdx, ba, xb, 4.0, 0.5)']).value, 10.50, 1e-9);
    assertAlmostEquals(last(['c = interp2(Cdx, ba, xb, 0.5, 0.5)']).value, 0, 1e-9);
  });

  await t.step('four-point interpolation — the worked example', () => {
    // b/a = 1.6, x/b = 0.25 sits between rows 1.75/1.5 and columns 0.2/0.3:
    //        0.2    0.3
    //  1.75  1.50   2.40   → at 0.25: 1.95
    //  1.5   1.00   1.70   → at 0.25: 1.35
    //  then at b/a 1.6, t = (1.6-1.5)/(1.75-1.5) = 0.4 → 1.35 + 0.4*0.60 = 1.59
    assertAlmostEquals(last(['c = interp2(Cdx, ba, xb, 1.6, 0.25)']).value, 1.59, 1e-9);
  });

  await t.step('bilinear is separable — one axis at a time gives the same answer', () => {
    // Interpolating rows first then columns must equal columns first then rows. Someone WILL
    // check this table by hand, and the two hand methods have to agree with the tool.
    const r = run([
      'a1 = interp(1.6, {1.5, 1.75}, {1.00, 1.50})', // col 0.2 between the two rows
      'a2 = interp(1.6, {1.5, 1.75}, {1.70, 2.40})', // col 0.3 between the two rows
      'byRow = interp(0.25, {0.2, 0.3}, {a1, a2})',
      'both = interp2(Cdx, ba, xb, 1.6, 0.25)',
    ]);
    assertAlmostEquals(r[r.length - 1].value, r[r.length - 2].value, 1e-9);
  });

  await t.step('descending rows and ascending columns both work, untouched', () => {
    // The whole point of the monotonic relaxation: the table stays in the source order a
    // reviewer will compare against.
    assertAlmostEquals(last(['c = interp2(Cdx, ba, xb, 3.5, 0.1)']).value, 2.10, 1e-9);
    assertAlmostEquals(last(['c = interp2(Cdx, ba, xb, 0.875, 0.2)']).value, 0.20, 1e-9);
  });

  await t.step('the END column is zero all the way down', () => {
    for (const ba of ['4.0', '2.2', '0.6']) {
      assertAlmostEquals(last([`c = interp2(Cdx, ba, xb, ${ba}, 0)`]).value, 0, 1e-9);
    }
  });

  await t.step("the folded x axis is the SHEET's job, and reads correctly when done", () => {
    // x/b = 0.7 is the same column as 0.3 — the table is symmetric about midspan. Expressed on
    // the sheet, not inside interp2, so the assumption is visible to a reviewer.
    const folded = last(['xf = min(0.7, 1 - 0.7)', 'c = interp2(Cdx, ba, xb, 1.75, xf)']);
    assertAlmostEquals(folded.value, 2.40, 1e-9);
  });

  await t.step('outside the published range is an ERROR, never an extrapolation', () => {
    // Values here can be negative in other tables of this family, so extrapolation could return
    // the wrong SIGN, not merely the wrong magnitude.
    assertMatch(last(['c = interp2(Cdx, ba, xb, 4.5, 0.2)']).error ?? '', /outside the table/);
    assertMatch(last(['c = interp2(Cdx, ba, xb, 0.4, 0.2)']).error ?? '', /outside the table/);
    assertMatch(last(['c = interp2(Cdx, ba, xb, 2, 0.6)']).error ?? '', /outside the table/);
    // The range reads low-to-high whichever way the axis runs.
    assertMatch(last(['c = interp2(Cdx, ba, xb, 9, 0.2)']).error ?? '', /\(0\.5 … 4\)/);
  });

  await t.step('shape mismatches are named, not silently tolerated', () => {
    assertMatch(
      last(['c = interp2(Cdx, {1, 2}, xb, 1.6, 0.25)']).error ?? '',
      /2 row keys for 10 rows/,
    );
    assertMatch(
      last(['c = interp2(Cdx, ba, {{0, 0.1}}, 1.6, 0.25)']).error ?? '',
      /2 column keys for 6 columns/,
    );
  });
});

Deno.test('interp accepts a descending axis (v2.8.0)', async (t) => {
  await t.step('descending keys interpolate as if reversed by hand', () => {
    const down = run(['y = interp(1.6, {2.0, 1.5}, {10, 20})']);
    const up = run(['y = interp(1.6, {1.5, 2.0}, {20, 10})']);
    // The pairs are (2.0, 10) and (1.5, 20). At 1.6 — nearer 1.5 — the answer is 18, whichever
    // order the vectors are written in. Both directions must agree AND be right; asserting only
    // that they agree would pass on two identically wrong numbers.
    assertAlmostEquals(down[down.length - 1].value, up[up.length - 1].value, 1e-9);
    assertAlmostEquals(down[down.length - 1].value, 18, 1e-9);
  });

  await t.step('a non-monotonic or duplicated axis is still refused', () => {
    // The relaxation keeps the guard that matters: a swapped pair or a repeated key is a
    // malformed table, not a legal direction.
    assertMatch(last(['y = interp(2, {1, 3, 2}, {1, 2, 3})']).error ?? '', /increase or decrease/);
    assertMatch(last(['y = interp(2, {1, 2, 2}, {1, 2, 3})']).error ?? '', /increase or decrease/);
  });

  await t.step('units on the keys are aligned before bracketing, not after', () => {
    // The latent bug this refactor fixed: the range check and bracket search compared raw values
    // while only the final lerp aligned units, so a table in ft read at inches bracketed against
    // the wrong pair and then interpolated confidently between them.
    const r = run(['y = interp(18 [in], {1 [ft], 2 [ft]}, {10, 20})']);
    assertAlmostEquals(r[r.length - 1].value, 15, 1e-9);
  });
});
