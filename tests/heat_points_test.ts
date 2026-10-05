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
import {
  addPointToSource,
  axisLabels,
  countPointsInSource,
  indexOfKey,
  keyAtIndex,
  removePointFromSource,
  valueAt,
} from '../src/blocks/heatmap.ts';

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

Deno.test('keyAtIndex inverts indexOfKey', async (t) => {
  // Right-click gives a pixel, the Points field holds key units. These two are the round trip
  // between them, and a mark placed by the mouse lands where the cursor was only if they agree.
  const asc = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
  const desc = [4.0, 3.0, 2.5, 2.0, 1.75, 1.5, 1.25, 1.0, 0.75, 0.5];

  await t.step('ascending, both ways round', () => {
    assertAlmostEquals(keyAtIndex(asc, 2.5), 0.25, 1e-9);
    assertAlmostEquals(indexOfKey(asc, keyAtIndex(asc, 3.7), 6)!, 3.7, 1e-9);
  });

  await t.step('descending, both ways round', () => {
    assertAlmostEquals(keyAtIndex(desc, 4.6), 1.6, 1e-9);
    assertAlmostEquals(indexOfKey(desc, keyAtIndex(desc, 6.25), 10)!, 6.25, 1e-9);
  });

  await t.step('with no keys the index IS the key', () => {
    assertAlmostEquals(keyAtIndex(null, 3.25), 3.25, 1e-9);
  });
});

Deno.test('editing the Points field as text', async (t) => {
  // Add and remove both work on the FIELD TEXT rather than a parallel list, so what the menu
  // places is the same thing the author could have typed — and can still edit afterwards.

  await t.step('the first point creates the literal', () => {
    assertEquals(addPointToSource('', 1.6, 0.25), '{{1.6, 0.25}}');
  });

  await t.step('a later point is spliced in, leaving the others alone', () => {
    assertEquals(addPointToSource('{{1.6, 0.25}}', 2, 0.4), '{{1.6, 0.25}, {2, 0.4}}');
  });

  await t.step('an EXPRESSION is refused, not overwritten', () => {
    // The case worth protecting: a mark that moves when the design moves. Rebuilding the field
    // from evaluated numbers would quietly trade that for a frozen literal.
    assertEquals(addPointToSource('pts', 1, 1), null);
    assertEquals(addPointToSource('mirror(pts)', 1, 1), null);
    assertEquals(removePointFromSource('pts', 0), null);
  });

  await t.step('removing keeps the neighbours VERBATIM, expressions included', () => {
    // Re-serialising from values would turn the surviving `{b/a, x_f}` into numbers — deleting
    // one mark must not silently freeze another.
    assertEquals(removePointFromSource('{{b/a, x_f}, {2, 0.4}}', 1), '{{b/a, x_f}}');
    assertEquals(removePointFromSource('{{b/a, x_f}, {2, 0.4}}', 0), '{{2, 0.4}}');
  });

  await t.step('removing the last one empties the field, not {{}}', () => {
    // `{{}}` is a matrix with no rows, which would render as an error where the author expects
    // to be back where they started.
    assertEquals(removePointFromSource('{{1.6, 0.25}}', 0), '');
  });

  await t.step('out of range removes nothing', () => {
    assertEquals(removePointFromSource('{{1.6, 0.25}}', 1), null);
    assertEquals(removePointFromSource('{{1.6, 0.25}}', -1), null);
  });

  await t.step('counting, which decides whether Clear All is offered', () => {
    assertEquals(countPointsInSource(''), null);
    assertEquals(countPointsInSource('{{1, 2}}'), 1);
    assertEquals(countPointsInSource('{{1, 2}, {3, 4}, {5, 6}}'), 3);
    assertEquals(countPointsInSource('pts'), null);
  });

  await t.step('a placed key never comes back in exponent form', () => {
    // The parser rejects `1e-5`, so a point placed on a fine axis has to be written plainly or
    // it lands in the field as text that will not evaluate.
    const s = addPointToSource('', 0.000012, 1234567)!;
    assertEquals(s.includes('e'), false);
    assertEquals(s, '{{0.000012, 1234570}}');
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
