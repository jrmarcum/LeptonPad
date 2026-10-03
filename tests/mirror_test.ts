// ---------------------------------------------------------------------------
// Unfolding a folded table: mirror() and mirrorkeys()
// ---------------------------------------------------------------------------
// The Cdx table stores half a plate — its columns are headed "0.1b / 0.9b", folded about midspan.
// `mirror` writes the other half so the 50 mirrored numbers are not retyped, and `mirrorkeys`
// produces the axis that goes with it.
//
// They are deliberately two functions. DATA repeats across the axis; a COORDINATE continues past
// it. Mirroring keys as if they were data gives 0, 0.1 … 0.5, 0.4, 0.3 — non-monotonic, which
// interp2 rejects outright and which would label the right half of the plate with the left
// half's positions.

import { assertAlmostEquals, assertEquals } from '@std/assert';
import { evalFormulaRows, type FormulaRow } from '../src/expr.ts';

function last(lines: string[]) {
  const out = evalFormulaRows(lines.map((e): FormulaRow => ({ e, d: '' })), {}, {});
  return out[out.length - 1];
}
const flat = (lines: string[]) => last(lines).matrix?.flat().map((q) => q.v) ?? [];

Deno.test('mirror', async (t) => {
  await t.step('columns mirror about the LAST one, which appears once', () => {
    // The centre is the axis, not a pair — duplicating it would widen the plate by one column.
    assertEquals(flat(['M = {{1, 2, 3}}', 'x = mirror(M)']), [1, 2, 3, 2, 1]);
  });

  await t.step('every row is mirrored, and the shape grows to 2n-1', () => {
    const r = last(['M = {{1, 2, 3}, {4, 5, 6}}', 'x = mirror(M)']);
    assertEquals(r.matrix?.length, 2);
    assertEquals(r.matrix?.[0].length, 5);
    assertEquals(r.matrix?.[1].map((q) => q.v), [4, 5, 6, 5, 4]);
  });

  await t.step('a Cdx row unfolds to the full plate width', () => {
    // 6 columns of half-plate become 11 of whole plate, zero at each end as the END column says.
    const row = flat(['M = {{0, 2.60, 6.20, 8.70, 10.10, 10.50}}', 'x = mirror(M)']);
    assertEquals(row.length, 11);
    assertEquals([row[0], row[10]], [0, 0]);
    assertEquals(row[5], 10.50); // midspan, once
    assertEquals(row.slice(0, 5), row.slice(6).reverse());
  });

  await t.step('one column is refused rather than silently doing nothing', () => {
    assertEquals(last(['M = {{1}, {2}}', 'x = mirror(M)']).error?.includes('two columns'), true);
  });
});

Deno.test('mirrorkeys', async (t) => {
  await t.step('keys CONTINUE past the axis instead of repeating', () => {
    // The distinction the two functions exist for: 0…0.5 continues 0.6…1.0.
    const k = flat(['v = {{0, 0.1, 0.2, 0.3, 0.4, 0.5}}', 'x = mirrorkeys(v)']);
    assertEquals(k.length, 11);
    k.forEach((v, i) => assertAlmostEquals(v, i * 0.1, 1e-9));
  });

  await t.step('the result stays monotonic, so interp2 still accepts it', () => {
    const k = flat(['v = {{0, 0.1, 0.5}}', 'x = mirrorkeys(v)']);
    for (let i = 1; i < k.length; i++) {
      assertEquals(k[i] > k[i - 1], true, `position ${i} is not increasing`);
    }
  });

  await t.step('a descending axis stays descending', () => {
    const k = flat(['v = {{1.0, 0.6, 0.5}}', 'x = mirrorkeys(v)']);
    assertEquals(k, [1, 0.6, 0.5, 0.4, 0]);
  });

  await t.step('the vector keeps its orientation', () => {
    assertEquals(last(['v = {{0, 1}}', 'x = mirrorkeys(v)']).matrix?.length, 1); // row stays a row
    assertEquals(last(['v = {0, 1}', 'x = mirrorkeys(v)']).matrix?.[0].length, 1); // column stays
  });

  await t.step('units are carried onto the continued keys', () => {
    const r = last(['v = {{0 [ft], 10 [ft]}}', 'x = mirrorkeys(v)']);
    assertEquals(r.matrix?.flat().map((q) => q.v), [0, 10, 20]);
    assertEquals(Object.keys(r.matrix![0][2].u), ['ft']);
  });
});

Deno.test('a mirrored table reads correctly end to end', () => {
  // The point of the pair: unfold the data and the axis together, then look the result up at a
  // position in the RIGHT half, which only exists after unfolding.
  const r = last([
    'xb = {{0, 0.1, 0.2, 0.3, 0.4, 0.5}}',
    'ba = {2.0, 1.0}',
    'M = {{0, 0.70, 2.00, 3.20, 4.00, 4.30}, {0, 0.10, 0.30, 0.60, 0.70, 0.80}}',
    'Mf = mirror(M)',
    'xf = mirrorkeys(xb)',
    // x/b = 0.7 is the mirror of 0.3, so it must read what 0.3 reads.
    'a = interp2(Mf, ba, xf, 2.0, 0.7)',
  ]);
  assertAlmostEquals(r.value, 3.20, 1e-9);
});
