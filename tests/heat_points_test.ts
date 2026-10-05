// ---------------------------------------------------------------------------
// Heat map: locating a marked point, and reading the value there
// ---------------------------------------------------------------------------
// Marks are stored in KEY units, never pixels — the discipline the plot's xMarkers already use —
// so `indexOfKey` is what turns a design location into a place on the field. It has to cope with
// an axis running either way, because the Cdx rows descend while its columns ascend.
//
// `valueAt` is shared by the hover readout and the marks on purpose: a mark and the hover at the
// same place must show the same number, and two copies of this arithmetic is exactly how they
// would stop doing so.

import { assertAlmostEquals, assertEquals } from '@std/assert';
import { axisLabels, indexOfKey, valueAt } from '../src/blocks/heatmap.ts';

Deno.test('indexOfKey', async (t) => {
  await t.step('an ascending axis', () => {
    const k = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    assertAlmostEquals(indexOfKey(k, 0, 6)!, 0, 1e-9);
    assertAlmostEquals(indexOfKey(k, 0.5, 6)!, 5, 1e-9);
    assertAlmostEquals(indexOfKey(k, 0.25, 6)!, 2.5, 1e-9);
  });

  await t.step('a DESCENDING axis, as the Cdx rows run', () => {
    const k = [4.0, 3.0, 2.5, 2.0, 1.75, 1.5, 1.25, 1.0, 0.75, 0.5];
    assertAlmostEquals(indexOfKey(k, 4.0, 10)!, 0, 1e-9);
    assertAlmostEquals(indexOfKey(k, 0.5, 10)!, 9, 1e-9);
    // 1.6 lies between 1.75 (index 4) and 1.5 (index 5), 60% of the way down.
    assertAlmostEquals(indexOfKey(k, 1.6, 10)!, 4.6, 1e-9);
  });

  await t.step('outside the table is null, NOT clamped to the edge', () => {
    // A mark slid quietly to the nearest edge would read as a value at a place the table does
    // not cover. The caller reports it instead.
    const k = [0, 0.5];
    assertEquals(indexOfKey(k, -0.1, 2), null);
    assertEquals(indexOfKey(k, 0.6, 2), null);
  });

  await t.step('with no keys the axis is the index itself', () => {
    assertAlmostEquals(indexOfKey(null, 2.5, 6)!, 2.5, 1e-9);
    assertEquals(indexOfKey(null, 6, 6), null); // past the last index
  });
});

Deno.test('valueAt', async (t) => {
  const g = [[0, 10], [20, 30]];

  await t.step('the corners are the samples themselves', () => {
    assertAlmostEquals(valueAt(g, 0, 0), 0, 1e-9);
    assertAlmostEquals(valueAt(g, 0, 1), 10, 1e-9);
    assertAlmostEquals(valueAt(g, 1, 0), 20, 1e-9);
    assertAlmostEquals(valueAt(g, 1, 1), 30, 1e-9);
  });

  await t.step('the middle is the average of all four', () => {
    assertAlmostEquals(valueAt(g, 0.5, 0.5), 15, 1e-9);
  });

  await t.step('it agrees with the Cdx worked example', () => {
    // The same b/a = 1.6, x/b = 0.25 that interp2 answers 1.59 for — reached here through grid
    // indices instead of keys. The picture and the calculation must not disagree.
    const rows = [[1.50, 2.40], [1.00, 1.70]]; // rows 1.75 and 1.5, cols 0.2 and 0.3
    // uy is 0.6, not 0.4: the ROW INDEX increases as b/a DECREASES, so 1.6 sits 60% of the way
    // from 1.75 down to 1.5. The interp2 test writes the same point as t = 0.4 because it
    // measures upward from 1.5. That inversion is precisely what indexOfKey exists to get right —
    // and it caught this expectation being written the wrong way round.
    assertAlmostEquals(valueAt(rows, 0.6, 0.5), 1.59, 1e-9);
  });
});

Deno.test('axisLabels splits a table-style corner', async (t) => {
  await t.step('left of the slash names the rows, right names the columns', () => {
    assertEquals(axisLabels('b/a    /    x'), { y: 'b/a', x: 'x' });
  });

  await t.step('the SPACED slash splits, so BOTH halves may contain one', () => {
    // The real Cdx corner. Splitting on the first slash gives y = "b"; splitting on the last
    // gives x = "b". Only the slash with space around it is the separator the author typed.
    assertEquals(axisLabels('b/a / x/b'), { y: 'b/a', x: 'x/b' });
  });

  await t.step('with no spaced slash, the last one splits', () => {
    // Nothing distinguishes label from separator here, so the fallback picks one and says so.
    assertEquals(axisLabels('depth/width'), { y: 'depth', x: 'width' });
  });

  await t.step('no slash labels the horizontal axis only', () => {
    assertEquals(axisLabels('position'), { y: '', x: 'position' });
    assertEquals(axisLabels(''), { y: '', x: '' });
  });
});
