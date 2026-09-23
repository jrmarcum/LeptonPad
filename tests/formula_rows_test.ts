// ---------------------------------------------------------------------------
// Formula block — row parsing and the round-trip contract
// ---------------------------------------------------------------------------
// A formula block stores its rows as JSON in `block.content`. Two functions move data between that
// string and the DOM: parseFormulaRows() reads it, and syncContent() writes it back from the row
// elements on every keystroke and blur. **Any field syncContent forgets is silently erased.**
// That is how per-row line spacing broke on 2026-09-23: `sp` round-tripped through parse but not
// through syncContent, so spacing survived until the user typed, then vanished from every row.

import { assertEquals, assertMatch } from '@std/assert';
import { fmtNum, parseFormulaRows, SIG_DEFAULT } from '../src/blocks/formula.ts';

Deno.test('result formatting', async (t) => {
  await t.step('groups thousands consistently, whole number or not', () => {
    // Whole numbers went through toLocaleString and got separators; everything else went through
    // toString and got none — so 29000 read as "29,000" while 1234567.891 read as "1234570":
    // rounded at the INTEGER part and ungrouped. A moment in lb·ft lands exactly there.
    assertEquals(fmtNum(29000), '29,000');
    assertEquals(fmtNum(1234567.891), '1,234,570');
    assertEquals(fmtNum(-1234.5678), '-1,234.57');
    assertEquals(fmtNum(0), '0');
    assertEquals(fmtNum(1.5), '1.5');
  });

  await t.step('significant digits are per call, defaulting to 6', () => {
    assertEquals(fmtNum(0.1241379310344828), '0.124138');
    assertEquals(fmtNum(0.1241379310344828, SIG_DEFAULT), '0.124138');
    assertEquals(fmtNum(0.1241379310344828, 3), '0.124');
    assertEquals(fmtNum(0.1241379310344828, 10), '0.124137931');
    assertEquals(fmtNum(1234567.891, 10), '1,234,567.891');
    assertEquals(fmtNum(1234567.891, 3), '1,230,000');
  });

  await t.step('very small and very large stay exponential', () => {
    assertEquals(fmtNum(1e-7), '1e-7');
    assertMatch(fmtNum(1e20), /e\+?20/);
  });

  await t.step('non-finite values pass through rather than formatting', () => {
    assertEquals(fmtNum(NaN), 'NaN');
    assertEquals(fmtNum(Infinity), 'Infinity');
  });
});

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

  await t.step('display precision round-trips per row, and the default is not stored', () => {
    const rows = parseFormulaRows(JSON.stringify([
      { e: 'a = 1', d: '', sd: 3 },
      { e: 'b = 2', d: '', sd: SIG_DEFAULT }, // the default is normalised away
      { e: 'c = 3', d: '' },
      { e: 'd = 4', d: '', sd: 99 }, // out of range — ignored rather than trusted
    ]));
    assertEquals(rows.map((r) => r.sd), [3, undefined, undefined, undefined]);
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
  for (const field of ['type', 'ref', 'sp', 'sd']) {
    assertMatch(
      syncBody,
      new RegExp(`obj\\.${field}\\s*=`),
      `syncContent() does not write FormulaRow.${field} back — it will be erased on the next keystroke`,
    );
  }
});
