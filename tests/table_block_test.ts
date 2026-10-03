// ---------------------------------------------------------------------------
// Table block — source parsing and heading evaluation
// ---------------------------------------------------------------------------
// The block is a pure renderer: it evaluates expressions and draws them, and never owns data.
// Drawing needs a DOM, but DECIDING what the headings are does not — and that is where a table
// goes wrong in the way that matters, by labelling a column with the heading of its neighbour.

import { assertEquals } from '@std/assert';
import { evalFormulaRows, type FnScope, type FormulaRow, type Scope } from '../src/expr.ts';
import { evalHeadings, parseTableSource } from '../src/blocks/table.ts';

/** Build a scope the way a sheet would, by running rows above the table. */
function scopeOf(lines: string[]): { scope: Scope; fnScope: FnScope } {
  const scope: Scope = {}, fnScope: FnScope = {};
  evalFormulaRows(lines.map((e): FormulaRow => ({ e, d: '' })), scope, fnScope);
  return { scope, fnScope };
}

Deno.test('table source', async (t) => {
  await t.step('round-trips the five fields', () => {
    const src = { title: 'T', corner: 'b/a / x', cols: '"A"', rows: 'ba', values: 'M' };
    assertEquals(parseTableSource(JSON.stringify(src)), src);
  });

  await t.step('an empty block parses to empty fields, not a crash', () => {
    assertEquals(parseTableSource(''), {
      title: '',
      corner: '',
      cols: '',
      rows: '',
      values: '',
    });
  });

  await t.step('corrupt content is preserved as the values expression', () => {
    // Same posture as the formula block with bad JSON: keep what the user had where they can see
    // it, rather than discarding it silently.
    assertEquals(parseTableSource('not json at all').values, 'not json at all');
  });
});

Deno.test('table headings', async (t) => {
  await t.step('text literals become headings in order', () => {
    const { scope, fnScope } = scopeOf([]);
    assertEquals(
      evalHeadings('"END", "0.1b / 0.9b", "0.5b"', scope, fnScope).headings,
      ['END', '0.1b / 0.9b', '0.5b'],
    );
  });

  await t.step('a comma INSIDE a heading is part of it, not a separator', () => {
    const { scope, fnScope } = scopeOf([]);
    assertEquals(
      evalHeadings('"Compact, rolled", "Slender"', scope, fnScope).headings,
      ['Compact, rolled', 'Slender'],
    );
  });

  await t.step('a vector is SPLICED, so the keys double as the headings', () => {
    // The Cdx row headings are the same `ba` vector interp2 keys on. Retyping them would be a
    // second copy of the data that can silently disagree with the first.
    const { scope, fnScope } = scopeOf(['ba = {4.0, 3.0, 2.5, 2.0}']);
    assertEquals(evalHeadings('ba', scope, fnScope).headings, ['4', '3', '2.5', '2']);
  });

  await t.step('numbers carry their unit into the heading', () => {
    const { scope, fnScope } = scopeOf(['L = 20 [ft]']);
    assertEquals(evalHeadings('L', scope, fnScope).headings, ['20 ft']);
  });

  await t.step('scalars and vectors mix in one list', () => {
    const { scope, fnScope } = scopeOf(['v = {1, 2}']);
    assertEquals(evalHeadings('"x", v, "y"', scope, fnScope).headings, ['x', '1', '2', 'y']);
  });

  await t.step('an empty list yields no headings rather than one blank', () => {
    const { scope, fnScope } = scopeOf([]);
    assertEquals(evalHeadings('', scope, fnScope).headings, []);
    assertEquals(evalHeadings('  ', scope, fnScope).headings, []);
  });

  await t.step('a bad expression reports which part failed', () => {
    const { scope, fnScope } = scopeOf([]);
    const out = evalHeadings('"ok", nope', scope, fnScope);
    assertEquals(out.headings, ['ok']); // the ones that worked are kept
    assertEquals(out.error?.includes('nope'), true);
  });
});
