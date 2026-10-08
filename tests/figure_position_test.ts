// ---------------------------------------------------------------------------
// A figure block is absolutely positioned, like every other block
// ---------------------------------------------------------------------------
// `.block` is `position: absolute`. `.figure-block` carried `position: relative` from the day it
// was written (2026-08-13), and since it comes later in the sheet with the same specificity, it
// won — a figure was the only block left in normal flow. A relatively positioned box keeps its
// flow slot and is merely offset from it, so `style.left/top` were added to wherever the flow put
// the figure: directly below every figure before it in the DOM. Stored (352,64), rendered
// (352,264); stored (72,264), rendered (72,664).
//
// Five releases (v2.11.5 – v2.11.11) chased "the figures lock to the bottom of the previous block"
// through the placement code, and every harness check read `style.left/top` — the STORED position,
// which was right all along. The rendered rect was wrong. known-issues § 39.
//
// A source guard, not a behavioural test: there is no DOM here, and the rule is a property of the
// stylesheet. If this fails, do not add `position` to `.figure-block` — the handles and caption
// are absolutely positioned against it either way, because an absolute box is a containing block.

import { assertEquals } from '@std/assert';

Deno.test('`.figure-block` does not override `.block`’s position', async () => {
  const css = await Deno.readTextFile(new URL('../src/styles/main.css', import.meta.url));
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // `.block { ... }` must be the absolute one, so the figure inherits it rather than restating it.
  const block = stripped.match(/(?:^|\n)\.block\s*\{([^}]*)\}/);
  assertEquals(block !== null, true, '.block rule not found');
  assertEquals(/position\s*:\s*absolute/.test(block![1]), true, '.block is not position: absolute');

  // Every rule whose selector list contains `.figure-block` as a whole selector — not a
  // descendant like `.figure-block .caption` — must leave `position` alone.
  const ruleRe = /([^{}]+)\{([^}]*)\}/g;
  const offenders: string[] = [];
  for (const m of stripped.matchAll(ruleRe)) {
    const selectors = m[1].split(',').map((s) => s.trim());
    const isFigureBlock = selectors.some((s) => /^(\.block)?\.figure-block$/.test(s));
    if (!isFigureBlock) continue;
    if (/position\s*:/.test(m[2])) offenders.push(m[1].trim());
  }
  assertEquals(offenders, [], 'a .figure-block rule sets position — the block falls into flow');
});
