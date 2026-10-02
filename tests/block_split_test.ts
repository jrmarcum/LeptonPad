// ---------------------------------------------------------------------------
// Splitting a block that laps onto the next page
// ---------------------------------------------------------------------------
// A block taller than the space left on its page runs past the bottom margin. "Split at page
// break" moves the overflow into a new block on the next page. Measuring which row or line
// overflows needs a DOM; CHOOSING where the cut may legally fall does not, and that is the part
// that can be wrong in a way nobody notices — so it lives in pure functions and is pinned here.
//
// Both functions return 0 for "cannot split". Callers must not read that as "move everything":
// that would empty the original and duplicate it into the new block.

import { assertEquals } from '@std/assert';
import { type FormulaRow } from '../src/expr.ts';
import { rowDepths, safeSplitIndex } from '../src/blocks/formula.ts';
import { safeTextSplitLine } from '../src/blocks/text.ts';

const R = (e: string, type?: FormulaRow['type']): FormulaRow =>
  type ? { e, d: '', type } : { e, d: '' };

Deno.test('formula split point', async (t) => {
  await t.step('nesting depth marks if/for bodies', () => {
    const rows = [
      R('a = 1'),
      R('a > 0', 'if'),
      R('b = 2'),
      R('', 'else'),
      R('b = 3'),
      R(
        '',
        'end',
      ),
      R('c = 4'),
    ];
    // The `if` header and the `else`/`end` keywords sit at depth 0; the bodies sit at depth 1.
    assertEquals(rowDepths(rows), [0, 0, 1, 0, 1, 0, 0]);
  });

  await t.step('a plain run splits exactly where asked', () => {
    const rows = [R('a = 1'), R('b = 2'), R('c = 3'), R('d = 4')];
    assertEquals(safeSplitIndex(rows, 2), 2);
    assertEquals(safeSplitIndex(rows, 3), 3);
  });

  await t.step('a split inside an if walks back to before the if', () => {
    // Splitting at row 2 or 4 would leave `if` without its `end` in one half and an orphan `end`
    // in the other — and the second half would reference variables the first half defines.
    const rows = [
      R('a = 1'),
      R('a > 0', 'if'),
      R('b = 2'),
      R('', 'else'),
      R('b = 3'),
      R(
        '',
        'end',
      ),
      R('c = 4'),
    ];
    assertEquals(safeSplitIndex(rows, 2), 1); // the `if` header itself is a legal boundary
    assertEquals(safeSplitIndex(rows, 4), 1);
    assertEquals(safeSplitIndex(rows, 5), 1); // `end` is a continuation, not a boundary
    assertEquals(safeSplitIndex(rows, 6), 6); // past the structure — fine
  });

  await t.step('a for body behaves the same as an if body', () => {
    const rows = [R('S = 0'), R('i = 1 to 4', 'for'), R('S = S + i'), R('', 'end'), R('x = S')];
    assertEquals(safeSplitIndex(rows, 2), 1);
    assertEquals(safeSplitIndex(rows, 4), 4);
  });

  await t.step('no safe point returns 0, meaning cannot split', () => {
    // Everything after row 0 is inside the structure, so there is nowhere legal to cut.
    const rows = [R('a > 0', 'if'), R('b = 2'), R('', 'end')];
    assertEquals(safeSplitIndex(rows, 1), 0);
    assertEquals(safeSplitIndex(rows, 2), 0);
    // A single row cannot be split at all.
    assertEquals(safeSplitIndex([R('a = 1')], 0), 0);
  });
});

Deno.test('text split line', async (t) => {
  await t.step('splits at the requested line when it is ordinary prose', () => {
    const md = 'one\ntwo\nthree\nfour';
    assertEquals(safeTextSplitLine(md, 2), 2);
  });

  await t.step('never splits inside a fenced code block', () => {
    // Cutting at 2 or 3 leaves an unterminated fence in each half: the first renders its
    // remainder as code, the second renders its code as prose.
    const md = 'intro\n```\ncode line\nmore code\n```\nafter';
    assertEquals(safeTextSplitLine(md, 3), 1);
    assertEquals(safeTextSplitLine(md, 5), 5); // past the closing fence
  });

  await t.step('does not orphan a heading at the foot of a page', () => {
    const md = 'intro\n## Loads\nthe loads are\nmore';
    assertEquals(safeTextSplitLine(md, 2), 1); // would strand "## Loads" above — back up to it
    assertEquals(safeTextSplitLine(md, 1), 1); // the heading itself leads the new block: fine
  });

  await t.step('a blank line is a separator, not a line to lead with', () => {
    const md = 'one\n\ntwo\nthree';
    assertEquals(safeTextSplitLine(md, 1), 0); // only the blank is available → cannot split
    assertEquals(safeTextSplitLine(md, 2), 2);
  });

  await t.step('no safe point returns 0', () => {
    assertEquals(safeTextSplitLine('just one line', 0), 0);
    assertEquals(safeTextSplitLine('```\nall code\n', 1), 0);
  });
});
