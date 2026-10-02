// ---------------------------------------------------------------------------
// Text as a value kind
// ---------------------------------------------------------------------------
// Added v2.7.0. Not a display flourish: text assigns to a variable and compares with == / !=,
// because plenty of engineering checks are not about numbers — section class, bolt grade, which
// limit state governs (Jon, 2026-10-02).
//
// The safety property is that text NEVER reaches code expecting a number. That is enforced by one
// guard, `scalarOnly`, which already refused matrices — widened rather than duplicated, so every
// one of its 21 call sites covers text too with no site to miss.

import { assertEquals, assertMatch } from '@std/assert';
import { evalFormulaRows, type FormulaRow } from '../src/expr.ts';
import { prettifyExpr } from '../src/utils/markdown.ts';

/** Run rows in one scope and return the statements. */
function run(lines: string[]) {
  return evalFormulaRows(lines.map((e): FormulaRow => ({ e, d: '' })), {}, {});
}

Deno.test('text values', async (t) => {
  await t.step('a literal assigns, and carries through as text not a number', () => {
    const r = run(['lbl = "Governs: flexure"']);
    assertEquals(r[0].text, 'Governs: flexure');
    assertEquals(
      Number.isNaN(r[0].value),
      true,
      'value must be NaN so no numeric path sees a number',
    );
  });

  await t.step('if() picks between text branches', () => {
    // The reason text exists. Only the CONDITION must be numeric.
    const r = run(['l = 0.4', 'class = if(l <= 0.38, "Compact", "Slender")']);
    assertEquals(r[1].text, 'Slender');
    assertEquals(run(['l = 0.2', 'c = if(l <= 0.38, "Compact", "Slender")'])[1].text, 'Compact');
  });

  await t.step('an assigned label compares with == and != , and reads as a check', () => {
    const r = run([
      'class = "Slender"',
      'class == "Slender"',
      'class == "Compact"',
      'class != "Compact"',
    ]);
    assertEquals([r[1].value, r[2].value, r[3].value], [1, 0, 1]);
    // isTest is what renders OK / NG rather than 1 / 0.
    assertEquals([!!r[1].isTest, !!r[2].isTest, !!r[3].isTest], [true, true, true]);
  });

  await t.step('ordering text is refused, not answered alphabetically', () => {
    // "Compact" < "Slender" is a fact about the alphabet, not about sections. Answering it would
    // look like a design check and not be one.
    assertMatch(run(['x = "A" < "B"'])[0].error ?? '', /only be compared with == or !=/);
    assertMatch(run(['x = "A" >= "B"'])[0].error ?? '', /only be compared with == or !=/);
  });

  await t.step('text never silently enters arithmetic', () => {
    // Before the guard was widened this produced a bare NaN — a result with no explanation.
    for (const src of ['x = "A" + 1', 'x = 2 * "A"', 'x = "A" / 2', 'x = "A" - "B"']) {
      assertMatch(run([src])[0].error ?? '', /needs a number, not text/, src);
    }
    assertMatch(run(['x = sqrt("A")'])[0].error ?? '', /needs a number, not text/);
    assertMatch(run(['x = "A"^2'])[0].error ?? '', /needs a number, not text/);
  });

  await t.step('comparing text against a number says so, and suggests the fix', () => {
    const e = run(['c = "Slender"', 'c == 1'])[1].error ?? '';
    assertMatch(e, /Cannot compare text/);
    assertMatch(e, /== "Slender"/); // names the remedy rather than only the refusal
  });

  await t.step('text cannot carry a unit', () => {
    assertMatch(run(['x = "A" [kip]'])[0].error ?? '', /cannot carry a unit/);
    assertMatch(run(['x = "A" [[kip]]'])[0].error ?? '', /cannot carry a unit/);
  });

  await t.step('an unterminated literal is an error, not a swallowed row', () => {
    assertMatch(run(['x = "oops'])[0].error ?? '', /Unclosed text/);
  });

  await t.step('a literal is opaque to the renderer', () => {
    // Rendered in place, the regex substitutions mangled prose and emitted BROKEN HTML:
    // "x_1 and y^2" came back with the closing quote inside a <sup>. A literal is the user's
    // words, not notation, so it is masked out before rendering and restored escaped.
    const html = prettifyExpr('note = "x_1 and y^2"');
    assertMatch(html, /"x_1 and y\^2"/);
    assertEquals(html.includes('<sub>'), false);
    assertEquals(html.includes('<sup>'), false);
    // A bracket inside text is prose, not a unit tag.
    assertEquals(prettifyExpr('note = "P [kip]"').includes('fp-unit'), false);
    // Greek names inside text stay as typed, consistent with the backslash rule outside it.
    assertMatch(prettifyExpr('note = "phi and alpha"'), /"phi and alpha"/);
    // And it is escaped, so a label can never inject markup.
    assertMatch(prettifyExpr('note = "<b>x</b>"'), /&lt;b&gt;/);
  });
});
