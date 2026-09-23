// ---------------------------------------------------------------------------
// Math engine — matrices, big operators, root finding
// ---------------------------------------------------------------------------
// Matrices carry a NaN in their scalar slot, so anything that reads that slot without a guard would
// print a plausible number. Half of this file is those guards.

import { assertEquals, assertError, assertValue, matrixText } from './_helpers.ts';

const P = 'P = {{1, 2}, {3, 4}}; ';
const Q = 'Q = {{5, 6}, {7, 8}}; ';
const R = 'R = {{1, 2, 3}, {4, 5, 6}}; '; // 2x3
const S = 'S = {{1, 2}, {3, 4}, {5, 6}}; '; // 3x2
const K = 'K = {{12 [kip/in], -6 [kip]}, {-6 [kip], 4 [kip*in]}}; ';
const F = 'F = {5.94 [kip], -2.96 [kip*in]}; ';

Deno.test('matrix literals', async (t) => {
  await t.step('rows, and a flat list as a column vector', () => {
    assertEquals(matrixText('A = {{1, 2}, {3, 4}}'), '[1, 2; 3, 4]');
    assertEquals(matrixText('u = {1, 2, 3}'), '[1; 2; 3]');
    assertEquals(matrixText('r = {{1, 2, 3}}'), '[1, 2, 3]');
  });

  await t.step('units per element, or one tag for all', () => {
    assertEquals(
      matrixText('K = {{12 [kip/in], -6 [kip]}, {-6 [kip], 4 [kip*in]}}'),
      '[12 kip/in, -6 kip; -6 kip, 4 in·kip]',
    );
    assertEquals(
      matrixText('K = {{12, -6}, {-6, 4}} [kip/in]'),
      '[12 kip/in, -6 kip/in; -6 kip/in, 4 kip/in]',
    );
  });

  await t.step('malformed literals are errors', () => {
    assertError('A = {{1, 2}, {3}}', /row 2 has 1 element/);
    assertError('A = {}', /Empty matrix/);
    assertError('A = {{1, {2}}}', /single value/);
  });

  await t.step('a whole-result tag may not overwrite units a matrix already has', () => {
    assertError(K + 'x = K / 2 [in]', /already has units/);
    assertEquals(matrixText(K + 'x = K / (2 [in])'), '[6 kip/in^2, -3 kip/in; -3 kip/in, 2 kip]');
  });
});

Deno.test('matrix arithmetic', async (t) => {
  await t.step('element-wise + − * / on the same shape', () => {
    assertEquals(matrixText(P + Q + 'X = P + Q'), '[6, 8; 10, 12]');
    assertEquals(matrixText(P + Q + 'X = Q - P'), '[4, 4; 4, 4]');
    assertEquals(matrixText(P + Q + 'X = P * Q'), '[5, 12; 21, 32]');
    assertEquals(matrixText(P + Q + 'X = Q / P'), '[5, 3; 2.333333333, 2]');
    assertEquals(matrixText(P + 'X = -P'), '[-1, -2; -3, -4]');
  });

  await t.step('per-element unit checks', () => {
    assertError(K + 'B = {{1 [kip], 1 [kip]}, {1 [kip], 1 [kip]}}; X = K + B', /Element \(1,1\)/);
    assertError(P + R + 'X = P + R', /sizes differ/);
  });

  await t.step('a number scales every element', () => {
    assertEquals(matrixText(P + 'X = 2 * P'), '[2, 4; 6, 8]');
    assertEquals(matrixText(P + 'X = P / 2'), '[0.5, 1; 1.5, 2]');
    assertEquals(matrixText(P + 'L = 10 [ft]; X = L * P'), '[10 ft, 20 ft; 30 ft, 40 ft]');
  });

  await t.step('undefined combinations are refused', () => {
    assertError(P + 'X = P + 1', /can't be added/);
    assertError(P + 'X = 2 / P', /inverse/);
  });

  await t.step("the .* product, with the article's own example", () => {
    assertValue('x = {{1, 2, 3}} .* {7, 9, 11}', 58); // 1x1 collapses to a number
    assertEquals(matrixText(P + Q + 'X = P .* Q'), '[19, 22; 43, 50]');
    assertEquals(matrixText(P + Q + 'X = Q .* P'), '[23, 34; 31, 46]'); // order matters
    assertEquals(matrixText(R + S + 'X = R .* S'), '[22, 28; 49, 64]');
    assertEquals(matrixText(R + S + 'X = R.*S'), '[22, 28; 49, 64]'); // spacing is irrelevant
    assertError(R + Q + 'X = R .* Q', /columns of the left/);
  });

  await t.step('K · u = F with mixed units', () => {
    assertEquals(
      matrixText(K + 'u = {0.5 [in], 0.01}; X = K .* u'),
      '[5.94 kip; -2.96 in·kip]',
    );
    assertError(K + 'X = K .* {1 [in], 1 [in]}', /Element \(1,1\)/);
  });
});

Deno.test('matrix functions', async (t) => {
  await t.step('transpose', () => {
    assertEquals(matrixText(R + 'X = transpose(R)'), '[1, 4; 2, 5; 3, 6]');
    assertEquals(matrixText('u = {1, 2, 3}; X = transpose(u)'), '[1, 2, 3]');
    assertValue('u = {1, 2, 3}; x = transpose(u) .* u', 14);
    assertEquals(matrixText(R + 'X = transpose(transpose(R))'), '[1, 2, 3; 4, 5, 6]');
    assertValue('x = transpose(5)', 5);
  });

  await t.step('determinant, including units and singularity', () => {
    assertValue(P + 'x = det(P)', -2);
    assertValue('x = det({{1, 2, 3}, {4, 5, 6}, {7, 8, 10}})', -3);
    assertValue('x = det({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}})', 0); // exactly 0, not 1e-16
    assertValue('x = det({{2, 3, 1, 5}, {1, 0, 3, 1}, {0, 2, -3, 2}, {0, 2, 3, 1}})', 1);
    assertValue(K + 'x = det(K)', 12, 'kip^2');
    assertValue('x = det({{4 [kip/in], 0}, {0, 2 [kip*in]}})', 8, 'kip^2'); // plain zeros are fine
    assertValue(P + 'x = det(transpose(P))', -2);
    assertError(R + 'x = det(R)', /square/);
    assertError('x = det({{1 [kip], 2 [in]}, {3 [s], 4 [kg]}})', /single unit/);
  });

  await t.step('inverse', () => {
    assertEquals(matrixText(P + 'X = inv(P)'), '[-2, 1; 1.5, -0.5]');
    assertEquals(matrixText(P + 'X = P .* inv(P)'), '[1, 0; 0, 1]'); // no 1e-16 dust
    assertEquals(matrixText(P + 'X = inv(inv(P))'), '[1, 2; 3, 4]');
    assertEquals(
      matrixText(K + 'X = inv(K)'),
      '[0.3333333333 in/kip, 0.5 1/kip; 0.5 1/kip, 1 1/(in·kip)]',
    );
    assertError('X = inv({{1, 2}, {2, 4}})', /singular/);
    assertError(R + 'X = inv(R)', /square/);
  });

  await t.step('solve, and el', () => {
    assertEquals(matrixText(K + F + 'u = solve(K, F)'), '[0.5 in; 0.01]');
    assertEquals(matrixText(K + F + 'X = K .* solve(K, F)'), '[5.94 kip; -2.96 in·kip]');
    assertEquals(matrixText(K + F + 'X = inv(K) .* F'), '[0.5 in; 0.01]');
    assertEquals(matrixText('X = solve({{2, 0}, {0, 4}}, {6, 8})'), '[3; 2]');
    assertValue(K + F + 'x = el(solve(K, F), 1, 1)', 0.5, 'in');
    assertValue(K + 'x = el(K, 1, 2)', -6, 'kip');
    assertError(K + 'x = el(K, 3, 1)', /outside 1…2/);
    assertError(K + 'x = el(K, 1.5, 1)', /whole number/);
    assertError(K + 'x = solve(K, {1 [kip], 1 [kip]})', /not unit-consistent/);
    assertError(P + 'x = solve(P, {1, 2, 3})', /3 rows/);
    assertError('x = solve({{1, 2}, {2, 4}}, {1, 2})', /singular/);
  });
});

Deno.test('a matrix never reaches scalar-only code', async (t) => {
  await t.step('functions, powers, comparisons and conversion all refuse one', () => {
    assertError(P + 'x = sqrt(P)', /single value/);
    assertError(P + 'x = P^2', /single value/);
    assertError(P + Q + 'x = P >= Q', /single value/);
    assertError(P + 'x = P [[mm]]', /single value/);
    assertError(P + 'x = sum(P, i, 1, 2)', /single value/);
  });
});

Deno.test('big operators', async (t) => {
  await t.step('sum and prod', () => {
    assertValue('x = sum(i^2, i, 1, 10)', 385);
    assertValue('x = prod(i, i, 1, 5)', 120);
    assertValue('x = sum(i, i, 5, 4)', 0); // empty range
    assertValue('x = prod(i, i, 5, 4)', 1);
    assertValue('x = sum(sum(i*j, j, 1, 3), i, 1, 3)', 36); // nested
    assertValue('x = sum(i [ft], i, 1, 3)', 6, 'ft');
    assertError('x = sum(i, i, 1.5, 3)', /whole numbers/);
    assertError('x = sum(i, 3, 1, 3)', /variable name/);
  });

  await t.step('integral — values, units and refusals', () => {
    assertValue('x = integral(x^2, x, 0, 3)', 9);
    assertValue('x = integral(sin(x), x, 0, \\pi)', 2, '', 1e-8);
    assertValue('x = integral(sin(x), x, 0, 2*\\pi)', 0, '', 1e-8); // the tolerance-scale fix
    assertValue('x = integral(exp(-x^2), x, -6, 6)', Math.sqrt(Math.PI), '', 1e-8);
    assertValue('x = integral(y, y, 3, 0)', -4.5); // reversed limits
    const load = 'L = 20 [ft]; w0 = 2 [kip/ft]; w(x) = w0 * x / L; ';
    assertValue(load + 'W = integral(w(x), x, 0 [ft], L)', 20, 'kip');
    assertValue(load + 'M = integral(w(x) * x, x, 0 [ft], L)', 266.6666667, 'ft·kip', 1e-6);
    assertError('x = integral(1/x, x, 0, 1)', /not finite/);
  });

  await t.step('findroot', () => {
    assertValue('x = findroot(y^2 - 4, y, 0, 10)', 2, '', 1e-9);
    assertValue('x = findroot(y^2 - 4, y, -10, 0)', -2, '', 1e-9);
    assertValue('x = findroot(cos(y) - y, y, 0, 2)', 0.7390851332, '', 1e-9);
    assertValue('x = findroot(exp(y) - 5, y, 0, 5)', Math.log(5), '', 1e-9);
    assertValue('x = findroot(sin(y), y, 3, 4)', Math.PI, '', 1e-9);
    const cap = 'f(c) = 30 [kip/in] * c - 2 [kip/in^2] * c^2; P_u = 100 [kip]; ';
    assertValue(cap + 'c = findroot(f(c) - P_u, c, 0 [in], 7.5 [in])', 5, 'in', 1e-8);
    assertValue(cap + 'c = findroot(f(c) - P_u, c, 7.5 [in], 12 [in])', 10, 'in', 1e-8);
    assertValue('t = findroot(sin(t) - 0.5, t, 0 [deg], 90 [deg])', 30, 'deg', 1e-7);
    assertError('x = findroot(y^2 + 1, y, -5, 5)', /does not change sign/);
    assertError('x = findroot(y^2 - 4, y, 0, 0)', /bounds are the same/);
    assertError('x = findroot(1/y, y, 0, 5)', /not finite/);
  });
});
