// ---------------------------------------------------------------------------
// Formula block — row parsing and the round-trip contract
// ---------------------------------------------------------------------------
// A formula block stores its rows as JSON in `block.content`. Two functions move data between that
// string and the DOM: parseFormulaRows() reads it, and syncContent() writes it back from the row
// elements on every keystroke and blur. **Any field syncContent forgets is silently erased.**
// That is how per-row line spacing broke on 2026-09-23: `sp` round-tripped through parse but not
// through syncContent, so spacing survived until the user typed, then vanished from every row.

import { assertEquals, assertMatch } from '@std/assert';
import { parseFormulaRows } from '../src/blocks/formula.ts';

Deno.test('formula row parsing', async (t) => {
  await t.step('legacy semicolon content still parses', () => {
    const rows = parseFormulaRows('a = 1; b = 2');
    assertEquals(rows.map((r) => r.e), ['a = 1', 'b = 2']);
  });

  await t.step('every optional field survives a parse', () => {
    const src = JSON.stringify([
      { e: 'x = 1', d: 'a note', ref: 'AISC 360 F2', sp: 2 },
      { e: 'x > 0', d: '', type: 'if' },
    ]);
    const rows = parseFormulaRows(src);
    assertEquals(rows[0], { e: 'x = 1', d: 'a note', ref: 'AISC 360 F2', sp: 2 });
    assertEquals(rows[1].type, 'if');
  });

  await t.step('single spacing is the default and is never stored', () => {
    // With no block-vs-row cascade, an absent `sp` and `sp: 1` mean the same thing — so 1 is
    // normalised away and never written back into the file.
    assertEquals(parseFormulaRows(JSON.stringify([{ e: 'a = 1', d: '', sp: 1 }]))[0].sp, undefined);
    assertEquals(parseFormulaRows(JSON.stringify([{ e: 'a = 1', d: '' }]))[0].sp, undefined);
    assertEquals(parseFormulaRows(JSON.stringify([{ e: 'a = 1', d: '', sp: 1.5 }]))[0].sp, 1.5);
  });

  await t.step('spacing is per row — one row carries it, its neighbours do not', () => {
    const rows = parseFormulaRows(JSON.stringify([
      { e: 'a = 1', d: '' },
      { e: 'b = 2', d: '', sp: 2 },
      { e: 'c = 3', d: '' },
    ]));
    assertEquals(rows.map((r) => r.sp), [undefined, 2, undefined]);
  });
});

Deno.test('syncContent writes back every field parseFormulaRows reads', async () => {
  // A source guard, not a behavioural test: syncContent() rebuilds block.content from the row
  // elements, so a field it does not copy is destroyed on the next keystroke. There is no DOM
  // here to exercise it against, so instead assert the function mentions every optional field.
  // If this fails after you add a field to FormulaRow, the fix is to carry it in syncContent —
  // not to delete this test.
  const src = await Deno.readTextFile(new URL('../src/blocks/formula.ts', import.meta.url));
  const body = src.slice(src.indexOf('function syncContent()'));
  // Comments are stripped, or a comment merely *mentioning* a field would satisfy the guard.
  const syncBody = body.slice(0, body.indexOf('\n  }\n')).replace(/\/\/.*$/gm, '');
  for (const field of ['type', 'ref', 'sp']) {
    assertMatch(
      syncBody,
      new RegExp(`obj\\.${field}\\s*=`),
      `syncContent() does not write FormulaRow.${field} back — it will be erased on the next keystroke`,
    );
  }
});
