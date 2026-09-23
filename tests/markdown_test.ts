// ---------------------------------------------------------------------------
// Display — formula rendering and markdown
// ---------------------------------------------------------------------------
// Rendering cannot produce a wrong number, but it can produce a wrong-looking sheet, and a crash
// here takes the block's preview down with it (see the unclosed-bracket case).

import { assertEquals, assertMatch, assertStringIncludes } from '@std/assert';
import { prettifyExpr, renderInlineMd, renderMarkdown } from '../src/utils/markdown.ts';

/** Strip the tags so an assertion can read like the sheet does. */
const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

Deno.test('symbols require the backslash', async (t) => {
  await t.step('Greek only with a mark; bare names render as typed', () => {
    assertEquals(text(prettifyExpr('\\phi_ty = 0.9')), 'φty = 0.9');
    assertEquals(text(prettifyExpr('phi_ty = 0.9')), 'phity = 0.9');
    assertEquals(text(prettifyExpr('x = \\phi\\alpha\\beta')), 'x = φαβ');
    assertEquals(text(prettifyExpr('x = \\Delta + \\Omega')), 'x = Δ + Ω');
  });

  await t.step('subscripts, ell, var forms and the overbar', () => {
    assertStringIncludes(prettifyExpr('\\phiM_n = 1'), '<sub>n</sub>');
    assertEquals(text(prettifyExpr('x = \\ell_b')), 'x = ℓb');
    assertEquals(text(prettifyExpr('x = \\varphi + \\varepsilon')), 'x = ϕ + ϵ');
    // The bar is a COMBINING macron after the letter (U+0304), not a precomposed character —
    // written out here so the assertion cannot pass or fail on invisible normalisation.
    assertEquals(text(prettifyExpr('x = \\bar{y}_c')), 'x = ȳc');
    assertEquals(text(prettifyExpr('x = \\bar{\\sigma}')), 'x = σ̄');
  });

  await t.step('sqrt and exp', () => {
    assertStringIncludes(prettifyExpr('r = \\sqrt(A)'), '√(');
    assertEquals(text(prettifyExpr('r = sqrt(A)')), 'r = sqrt(A)'); // bare stays text
    assertEquals(text(prettifyExpr('y = exp(2)')), 'y = e2'); // e with a raised 2
    assertStringIncludes(prettifyExpr('y = exp(2)'), '<sup>2</sup>');
  });

  await t.step('units are never Greek-substituted', () => {
    assertStringIncludes(prettifyExpr('p = 5 [psi]'), '>psi<');
    assertStringIncludes(prettifyExpr('p = 5 [psi]'), 'fp-unit');
  });
});

Deno.test('expressions', async (t) => {
  await t.step('fractions, comparisons and products', () => {
    assertStringIncludes(prettifyExpr('x = a/b'), 'class="frac"');
    assertStringIncludes(prettifyExpr('x = f_a/F_a >= 0.2'), '≥'); // splits before the fraction
    assertStringIncludes(prettifyExpr('x = a <= b'), '≤');
    assertStringIncludes(prettifyExpr('x = a != b'), '≠');
    assertStringIncludes(prettifyExpr('x = if(y >= 0, 1, 0)'), '≥'); // nested in a call
    assertEquals(text(prettifyExpr('x = a*b')), 'x = a · b');
    assertEquals(text(prettifyExpr('x = A .* B')), 'x = A × B'); // matrix product
  });

  await t.step('any exponent is raised', () => {
    assertStringIncludes(prettifyExpr('y = x^2'), '<sup>2</sup>');
    assertStringIncludes(prettifyExpr('y = exp(-x/2)'), '<sup>');
    assertStringIncludes(prettifyExpr('y = x^(2*n)'), '<sup>');
    assertEquals(text(prettifyExpr('y = 2^-1')), 'y = 2-1'); // -1 raised, not subtraction
    assertStringIncludes(prettifyExpr('y = 2^3^2'), '<sup>3<sup>2</sup></sup>');
  });

  await t.step('big operators, matrices and call arguments', () => {
    assertStringIncludes(prettifyExpr('x = sum(i^2, i, 1, 10)'), 'bigop-sym');
    assertStringIncludes(prettifyExpr('x = sum(i^2, i, 1, 10)'), 'Σ');
    assertStringIncludes(prettifyExpr('x = integral(w(x), x, 0, L)'), '∫');
    assertStringIncludes(prettifyExpr('x = integral(w(x), x, 0, L)'), 'dx');
    assertStringIncludes(prettifyExpr('A = {{1, 2}, {3, 4}}'), 'class="mat"');
    assertStringIncludes(prettifyExpr('x = transpose(A)'), '<sup>T</sup>');
    assertStringIncludes(prettifyExpr('x = inv(A)'), '<sup>−1</sup>');
    assertStringIncludes(prettifyExpr('x = solve({{1, 2}, {3, 4}}, {1, 2})'), 'class="mat"');
    assertStringIncludes(prettifyExpr('x = det(K_1)'), '<sub>1</sub>');
  });

  await t.step('an unclosed bracket does not blow the stack (the 2.3.11 crash)', () => {
    assertEquals(typeof prettifyExpr('[]('), 'string');
    assertEquals(typeof prettifyExpr('x = a['), 'string');
    assertEquals(typeof prettifyExpr('![]('), 'string');
  });
});

Deno.test('markdown text blocks', async (t) => {
  const doc = [
    '# Heading',
    '',
    'Text with **bold**, *italic*, `code`, [link](https://example.com).',
    '',
    '- bullet',
    '- [ ] task',
    '',
    '> quote',
    '',
    'Inline $f_a/F_a <= 1.0$ here.',
    '',
    '$$E = m*c^2$$',
  ].join('\n');
  const html = renderMarkdown(doc);

  await t.step('structure renders', () => {
    assertStringIncludes(html, '<h1>Heading</h1>');
    assertStringIncludes(html, '<strong>bold</strong>');
    assertStringIncludes(html, '<em>italic</em>');
    assertStringIncludes(html, '<code>code</code>');
    assertStringIncludes(html, 'href="https://example.com"');
    assertStringIncludes(html, '<li>bullet</li>');
    assertStringIncludes(html, 'type="checkbox"');
    assertStringIncludes(html, '<blockquote>');
  });

  await t.step('math inside text uses the same renderer', () => {
    assertStringIncludes(html, 'md-math');
    assertStringIncludes(html, '≤');
    assertStringIncludes(html, '<sup>2</sup>');
    assertStringIncludes(renderInlineMd('units in $\\sigma <= F_b$'), '≤');
  });

  await t.step('a javascript: URL is not rendered as a link target', () => {
    assertMatch(renderMarkdown('[x](javascript:alert(1))'), /href="#"/);
  });
});
