// ---------------------------------------------------------------------------
// There is exactly ONE vertical page-snap, and it lives in state.ts
// ---------------------------------------------------------------------------
// The grid origin moved under the title block in v2.6.5. Everything that positions a block had to
// follow it, and four separate copies of "snap to this page's lattice" did not all get the memo —
// each discovered one release at a time, by Jon, from screenshots:
//
//   Canvas.addBlock / updateMarginGuide   fixed v2.6.7
//   placeBlock                            fixed v2.6.7
//   moveGridCursor's local `gridOrigin`   fixed v2.6.13  (ghost landed off the block's lattice)
//   main.ts's `mSnapY`                    fixed v2.6.13  (a plain CLICK walked a block down a square)
//
// They were invisible to every other test because the two lattices COINCIDE whenever the title
// block is off, which is the state a test sets up by default.
//
// A source guard, not a behavioural test: the rule is "nobody reconstructs the page origin", and
// that is a property of the source. If this fails, do not add your expression to the allowlist —
// call `snapToPageGrid` instead. It is exported for exactly this reason.

import { assertEquals } from '@std/assert';

/**
 * `src/state.ts` holds the one definition. Everywhere else, a line may use the expression only by
 * carrying a `page-origin-ok:` marker with a reason — which forces the decision to be made rather
 * than inherited. The legitimate case is the TITLE BLOCK's own position: it sits at the top of the
 * page's content area, *above* the work area, so `margins.top` is genuinely its anchor.
 */
const ALLOWED_FILE = 'src/state.ts';
const MARKER = 'page-origin-ok';

Deno.test('no module rebuilds the page grid origin for itself', async () => {
  const roots = ['src/canvas.ts', 'src/dnd.ts', 'src/main.ts', 'src/state.ts'];

  // `pi * PAGE_H + margins.top` and its spelling variants — the expression every stale copy used.
  const ORIGIN_RE = /\*\s*PAGE_H\s*\+\s*margins\.top|PAGE_H\s*\+\s*margins\.top/;

  const offenders: string[] = [];
  for (const path of roots) {
    const src = await Deno.readTextFile(new URL(`../${path}`, import.meta.url));
    const lines = src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n');
    if (path === ALLOWED_FILE) continue;
    lines.forEach((line, i) => {
      if (line.trim().startsWith('//')) return; // prose about the bug is not the bug
      if (!ORIGIN_RE.test(line)) return;
      // Exempt with a reason, on the line itself or in the comment block immediately above it —
      // the latter because these reasons do not fit in the margin of a 100-column line.
      const near = [line, lines[i - 1] ?? '', lines[i - 2] ?? ''].join('\n');
      if (near.includes(MARKER)) return;
      offenders.push(`${path}:${i + 1}  ${line.trim()}`);
    });
  }

  assertEquals(
    offenders,
    [],
    'These rebuild the page grid origin instead of calling snapToPageGrid()/firstGridLine().\n' +
      'The grid starts at the WORK AREA top, not margins.top — the two differ by the title ' +
      'block height and coincide only when it is off, so this will pass every manual check ' +
      'until a sheet has a title block:\n  ' + offenders.join('\n  '),
  );
});
