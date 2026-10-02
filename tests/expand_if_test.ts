// ---------------------------------------------------------------------------
// Expanding `x = if(c, a, b)` into if/else rows
// ---------------------------------------------------------------------------
// An explicit action, not an automatic rewrite on entry: typing one thing and getting five rows is
// surprising, cannot be collapsed back, and is impossible when the call is a sub-expression.
// So the question this pins is mostly "when does it REFUSE" — the action is hidden whenever
// expandIfRow returns null, and a wrong yes rewrites the user's formula into something else.

import { assertEquals } from '@std/assert';
import { type FormulaRow } from '../src/expr.ts';
import { expandIfRow } from '../src/blocks/formula.ts';

const row = (e: string, extra: Partial<FormulaRow> = {}): FormulaRow => ({ e, d: '', ...extra });
/** Compact view of the result: `type:expr` per row. */
const shape = (rs: FormulaRow[] | null) => rs?.map((r) => `${r.type ?? ''}:${r.e}`) ?? null;

Deno.test('expand if() to rows', async (t) => {
  await t.step('a simple call becomes if / assign / else / assign / end', () => {
    assertEquals(shape(expandIfRow(row('phi = if(x > 0, 0.9, 0.75)'))), [
      'if:x > 0',
      ':phi = 0.9',
      'else:',
      ':phi = 0.75',
      'end:',
    ]);
  });

  await t.step('a nested else becomes an elseif chain, not a nested block', () => {
    // This is the case the inline form stops being readable for, so it is the case worth getting
    // right: four rows of plain logic instead of if(a, 1, if(b, 2, 3)).
    assertEquals(shape(expandIfRow(row('k = if(a, 1, if(b, 2, 3))'))), [
      'if:a',
      ':k = 1',
      'elseif:b',
      ':k = 2',
      'else:',
      ':k = 3',
      'end:',
    ]);
  });

  await t.step('text branches survive, including a comma inside the text', () => {
    // splitTopLevelCommas had to learn about quotes for this — a comma in a label is not a
    // separator, and before text existed there was nothing that could contain one.
    assertEquals(shape(expandIfRow(row('c = if(l <= 0.38, "Compact, rolled", "Slender")'))), [
      'if:l <= 0.38',
      ':c = "Compact, rolled"',
      'else:',
      ':c = "Slender"',
      'end:',
    ]);
  });

  await t.step('the description and reference move to the condition row', () => {
    // The condition is the row a reader looks at to understand the choice, and an if header is
    // where the block group hangs its description and reference.
    const out = expandIfRow(row('p = if(c, 1, 2)', { d: 'Section class', ref: 'AISC B4.1' }))!;
    assertEquals([out[0].d, out[0].ref], ['Section class', 'AISC B4.1']);
    assertEquals(out[1].d, ''); // not duplicated onto the assignment
  });

  await t.step('display precision follows the rows that produce results', () => {
    const out = expandIfRow(row('p = if(c, 1, 2)', { sd: 4, sp: 1.5 }))!;
    assertEquals(out[1].sd, 4); // the assignments
    assertEquals(out[3].sd, 4);
    assertEquals(out[0].sd, undefined); // not the condition — it has no numeric result
    assertEquals(out.every((r) => r.sp === 1.5), true); // spacing is the row's look, so all of it
  });

  await t.step('REFUSES when the call is not the whole right-hand side', () => {
    // The dangerous yes. Expanding this would silently drop the `* phi`.
    assertEquals(expandIfRow(row('M = if(c, M_p, M_r) * phi')), null);
    assertEquals(expandIfRow(row('M = 2 * if(c, 1, 2)')), null);
  });

  await t.step('REFUSES anything that is not a plain named assignment of an if()', () => {
    assertEquals(expandIfRow(row('if(c, 1, 2)')), null); // no name to assign to
    assertEquals(expandIfRow(row('x = y + 1')), null); // not an if at all
    assertEquals(expandIfRow(row('x = if(c, 1)')), null); // wrong arity
    assertEquals(expandIfRow(row('x = if(c, 1, 2, 3)')), null);
    assertEquals(expandIfRow(row('x > 0', { type: 'if' })), null); // already a control row
    assertEquals(expandIfRow(row('P = 10 [kip]', { in: 'P_u' })), null); // an input row holds a value
    assertEquals(expandIfRow(row('x == if(c, 1, 2)')), null); // a comparison, not an assignment
  });
});
