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

  await t.step('the prime, and that it does not swallow the subscript', () => {
    // f'_c is the case this exists for: in concrete work f'_c and f_c are different quantities,
    // and until this existed both had to be spelled `f_c`.
    assertEquals(text(prettifyExpr('x = \\prime{f}_c')), 'x = f′c');
    assertEquals(text(prettifyExpr('x = \\prime{\\sigma}')), 'x = σ′');

    // ⚠️ The part that was nearly wrong. U+2032 PRIME is a SPACING character, not a combining
    // one, so the subscript matcher had to be told about it separately. Without that the base
    // match stops at `f` and `_c` renders as literal text beside the prime.
    assertStringIncludes(prettifyExpr('x = \\prime{f}_c'), '<sub>c</sub>');
    assertStringIncludes(prettifyExpr('x = \\prime{f}_c_1'), '<sub>c,1</sub>');
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

  await t.step('repeated division draws what it evaluates (the 2.3.31 divergence)', () => {
    // `/` is left-associative: a/b/c is (a/b)/c. The renderer split at the FIRST top-level `/`,
    // drawing a over (b/c) — so the stamped equation and the stamped number disagreed, by 10^6
    // for `M/S/1000`. The nested fraction belongs in the NUMERATOR.
    const shape = (h: string) =>
      h.replace(/<span class="frac"><span>/g, 'F(').replace(/<\/span><span>/g, ' / ')
        .replace(/<\/span><\/span>/g, ')').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

    assertEquals(shape(prettifyExpr('M/S/1000')), 'F(F(M / S) / 1000)');
    assertEquals(shape(prettifyExpr('a/b/c/d')), 'F(F(F(a / b) / c) / d)');
    // Explicit parentheses must still nest in the DENOMINATOR — that is a different expression.
    assertEquals(shape(prettifyExpr('a/(b/c)')), 'F(a / F(b / c))');
    // Cases that were already correct must stay correct.
    assertEquals(shape(prettifyExpr('a*b/c')), 'F(a · b / c)');
    assertEquals(shape(prettifyExpr('a/(b*c)')), 'F(a / b · c)');
    assertStringIncludes(prettifyExpr('P/2 * x'), 'class="frac"'); // P/2 stays a fraction, · x after
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

  await t.step('el() renders as a subscripted element, not as a call', () => {
    // `el(K, 1, 2)` printed literally read as code in the middle of typeset maths. The name has to
    // stay — `K(1,2)` is a call, `K[1,2]` is unit syntax, `K_12` is a subscripted variable — so the
    // display is what changed. Added 2026-10-02.
    assertStringIncludes(prettifyExpr('x = el(K, 1, 2)'), '<sub>1,2</sub>');
    assertEquals(prettifyExpr('x = el(K, 1, 2)').includes('el('), false);
    // Indices go through the expression renderer rather than being printed raw.
    assertStringIncludes(prettifyExpr('x = el(u, i_1, 1)'), '<sub>i<sub>1</sub>,1</sub>');
    // A compound subject is parenthesised, so the subscript clearly applies to all of it.
    assertStringIncludes(prettifyExpr('x = el(solve(K, F), 1, 1)'), '(');
    // Wrong arity is left to the generic call renderer — it is a user function, not element access.
    assertStringIncludes(prettifyExpr('x = el(K, 1)'), 'el(');
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
