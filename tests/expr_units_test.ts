// ---------------------------------------------------------------------------
// Math engine — units, arithmetic, constants, functions
// ---------------------------------------------------------------------------
// The failure mode this suite exists for is **a wrong number that looks right** on a sheet someone
// stamps. Every case below is a rule the engine is expected to hold; several are bugs that were
// found in the browser and must never come back.

import {
  assertEquals,
  assertError,
  assertMatch,
  assertValue,
  last,
  matrixText,
  rows,
} from './_helpers.ts';
import type { Scope } from '../src/expr.ts';

Deno.test('unit tags — declare, inline, and the multi-tag rule', async (t) => {
  await t.step('a trailing tag declares the unit of a bare number', () => {
    assertValue('b = 150 [mm]', 150, 'mm');
  });

  await t.step('a single trailing tag declares when the result is a plain number', () => {
    assertValue('b = 150; h = 300; A = b*h [mm^2]', 45000, 'mm^2');
    assertValue('x = 150 [mm]', 150, 'mm');
    // A matrix of plain numbers declares too — every element takes the tag.
    assertEquals(
      matrixText('K = {{12, -6}, {-6, 4}} [kip/in]'),
      '[12 kip/in, -6 kip/in; -6 kip/in, 4 kip/in]',
    );
  });

  await t.step('a single trailing tag CONVERTS when the result already has a unit (2.3.29)', () => {
    // It used to relabel: `l = 12 [ft]; x = l [in]` reported "12 in" — the unit changed and the
    // number did not. A conversion is kind-checked like any other, so a nonsense one now says so.
    assertValue('l = 12 [ft]; x = l [in]', 144, 'in');
    assertValue('m = 5 [kg]; x = m [lbm]', 11.0231131093, 'lbm', 1e-8);
    assertValue('E = 29000 [ksi]; I = 100 [in^4]; EI = E * I [kip*in^2]', 2900000, 'in^2·kip');
    assertError('L = 25 [ft]; s = L * 12 [in/ft]', /Can't convert ft to in\/ft/);
  });

  await t.step('several tags each apply to their own term (the 2.2.3 fix)', () => {
    assertValue('d_bolt = 0.75 [in]; d = d_bolt + 0.0625 [in] + 0.0625 [in]', 0.875, 'in');
  });

  await t.step('inline tags multiply and divide correctly', () => {
    assertValue('p = 2 [in] * 3 [in]', 6, 'in^2');
    // Parenthesised, the tag belongs to the 12 and the ft cancels. Written bare — `L * 12 [in/ft]`
    // — the tag is the statement's only one and relabels the whole result instead; see the
    // "single trailing tag" case below.
    assertValue('L = 25 [ft]; s = L * (12 [in/ft])', 300, 'in');
  });

  await t.step('a power applies to the tagged quantity', () => {
    assertValue('A = 3 [in]^2', 9, 'in^2');
  });

  await t.step('mismatched addition is an error, never a coerced number', () => {
    assertError('x = 1 [ft] + 1 [kg]', /Unit mismatch/);
    assertError('x = 1 [lbf] + 1 [lbm]', /Unit mismatch/); // force and mass stay distinct
  });

  await t.step('addition converts units of the same kind into the left-hand one', () => {
    // Until 2.3.24 this was an error and the user did the conversion by hand.
    assertValue('x = 1 [ft] + 1 [in]', 1.0833333333, 'ft', 1e-9);
    assertValue('x = 12 [in] + 1 [ft]', 24, 'in'); // the LEFT unit wins
    assertValue('x = 1 [ft] - 6 [in]', 0.5, 'ft');
    assertValue('x = 2 [kip] + 1000 [lbf]', 3, 'kip');
    assertValue('A = 2 [in^2] + 1 [in2]', 3, 'in^2'); // both spellings of square inches
    assertValue('x = 1 [ft] + 1', 2, 'ft'); // a bare number still means "in that unit"
  });

  await t.step('compound units expand so they cancel', () => {
    // E·I with E in ksi (kip/in²) and I in in⁴ → kip·in², not ksi·in⁴
    assertValue('E = 29000 [ksi]; I = 100 [in^4]; EI = E * I', 2900000, 'in^2·kip');
  });

  await t.step('an unknown unit is rejected, not invented (2.3.27)', () => {
    // `[ksii]` used to become a phantom unit: it displayed as `5 ksii`, never cancelled, and only
    // failed much later at conversion. There is deliberately no way to define a unit.
    assertError('x = 5 [ksii]', /Unknown unit "ksii" — did you mean "ksi"\?/);
    assertError('x = 5 [inn]', /did you mean "in"\?/);
    assertError('n = 4 [bolts]', /Unknown unit "bolts"/);
    assertError('x = 5 [zzzzzzzz]', /Unknown unit "zzzzzzzz"$/); // nothing close — no guess
    assertError('x = 2 [kip] [[inchs]]', /Unknown unit "inchs"/); // also inside [[…]]
  });

  await t.step('a bad unit marks its own row and no others', () => {
    // Both tags are parsed outside the per-statement try, so an unguarded throw here used to
    // escape evalStatements and take the whole block down instead of marking one row.
    const r = rows(['a = 1 [in]', 'b = 2 [inn]', 'c = 3 [ft]']);
    assertEquals(r[0].error, undefined);
    assertMatch(r[1].error ?? '', /Unknown unit/);
    assertEquals(r[2].error, undefined);
    assertEquals(r[2].value, 3);
  });

  await t.step('[1/unit] is not a unit named "1"', () => {
    assertValue('x = 4 [kip] * 2 [1/kip]', 8, '');
    assertValue('y = 1 [1/s] * 3 [s]', 3, '');
  });
});

Deno.test('[[targetUnit]] conversion', async (t) => {
  await t.step('simple scaling', () => {
    assertValue('x = 200 [MPa] [[ksi]]', 29.0075, 'kip/in^2', 1e-3); // ksi displays expanded
  });

  await t.step('compound conversion through the SI base', () => {
    assertValue('F = 10 [kip]; A = 2 [in^2]; s = F/A [[psi]]', 5000, 'lbf/in^2');
  });

  await t.step('affine temperature applies the offset', () => {
    assertValue('t = 20 [C] [[F]]', 68, 'F');
  });

  await t.step('a propagated unit converts', () => {
    assertValue('l = 12 [ft]; x = l^2 [[in^2]]', 20736, 'in^2');
  });

  await t.step('converting between different kinds is refused', () => {
    // Factor scaling multiplies anything, so without a kind check these came back as real-looking
    // answers: `5 [kip] [[in]]` reported 875634 in, `100 [ksi] [[ft]]` billions of feet (2.3.26).
    assertError('x = 5 [kip] [[in]]', /Can't convert kip to in/);
    assertError('x = 12 [in] [[kg]]', /different kinds/);
    assertError('x = 100 [ksi] [[ft]]', /Can't convert/);
    assertError('x = sin(1) [[in]]', /plain number/);
  });

  await t.step('moment units convert across the metric/imperial line', () => {
    // kN·mm was missing until 2.3.25 — and an unknown tag becomes a phantom unit rather than an
    // error, so `[kN-mm]` had been quietly producing something that could never convert.
    assertValue('x = 1000 [kN-mm] [[kN-m]]', 1, 'kN·m');
    assertValue('x = 1 [kN-m] [[kN-mm]]', 1000, 'kN·mm');
    assertValue('M = 50 [kN-m] [[kip-ft]]', 36.8781, 'ft·kip', 1e-4);
    assertValue('x = 1 [kN-mm] + 1 [N-m]', 2, 'kN·mm'); // same kind, converts
  });

  await t.step('mass, energy and force units are all present', () => {
    assertValue('m = 10 [lbm] [[kg]]', 4.5359237, 'kg', 1e-7);
    assertValue('m = 1 [kg] [[lbm]]', 2.2046226218, 'lbm', 1e-8);
    // J and kJ are compound ids, so they expand on display — 1 J reads as `m·N`, not `J`.
    assertValue('E = 1 [J] [[N-m]]', 1, 'm·N');
    assertValue('E = 1000 [J] [[kJ]]', 1, 'kN·m');
  });
});

Deno.test('order of operations', async (t) => {
  await t.step('unary minus binds looser than ^ (the 2.3.0 fix)', () => {
    assertValue('x = -2^2', -4);
    assertValue('y = 3; z = -y^2', -9);
    assertValue('w = (-2)^2', 4);
    assertValue('v = -3 [in]^2', -9, 'in^2');
  });

  await t.step('exponents are right-associative and may be negative', () => {
    assertValue('a = 2^-1', 0.5);
    assertValue('b = 2^3^2', 512);
  });

  await t.step('ordinary precedence still holds', () => {
    assertValue('x = 2 * 3 / 4 - 1', 0.5);
    assertValue('y = 1 - 2^2', -3);
    assertValue('z = 2 * -3', -6);
  });
});

Deno.test('comparisons', async (t) => {
  await t.step('== and != are comparisons, not assignments (the 2.2.6 fix)', () => {
    assertValue('a = 2; c = a == 2', 1);
    assertValue('a = 2; c = a != 3', 1);
    assertValue('a = 2; c = a <> 3', 1);
  });

  await t.step('a function call may be compared without redefining the function', () => {
    const r = last('f(x) = 2*x; c = f(1.5) == 3');
    assertEquals(r.error, undefined);
    assertEquals(r.value, 1);
  });

  await t.step('a trailing unit binds to the operand, not the whole comparison', () => {
    // `b > 8 [in]` used to have its [in] stripped as a whole-statement tag, which a comparison
    // then discards — so it silently became `b > 8`, inches against a bare number (2.3.23).
    assertValue('b = 6 [in]; c = b > 8 [in]', 0, '');
    assertValue('b = 6 [in]; c = b < 8 [in]', 1, '');
    assertValue('b = 10 [in]; c = b >= 10 [in]', 1, '');
  });

  await t.step('units of the same kind convert before comparing', () => {
    // Before 2.3.23 comparisons ignored units and compared the raw numbers, so these were
    // answered — wrongly and silently. `1 [ft] > 1 [in]` was false; `6 [in] > 0.5 [ft]` was true.
    assertValue('x = 1 [ft] > 1 [in]', 1, '');
    assertValue('x = 1 [ft] == 12 [in]', 1, '');
    assertValue('b = 6 [in]; c = b > 0.5 [ft]', 0, ''); // 6 in IS 0.5 ft — not greater
    assertValue('x = 200 [MPa] > 20 [ksi]', 1, ''); // compound, through the SI base
    assertValue('t = 20 [C] > 50 [F]', 1, ''); // affine: 50 °F is 10 °C
  });

  await t.step('a different kind of unit is still an error', () => {
    assertError('b = 6 [in]; c = b > 8 [kg]', /Unit mismatch: in ≠ kg/);
    assertError('x = 1 [lbf] > 1 [lbm]', /Unit mismatch/); // force is not mass
  });

  await t.step('a comparison against a bare number is refused', () => {
    // `b > 8` where b is in inches is not a check — it is 6 against 8. Addition still allows a
    // bare operand (`1 [ft] + 1`), because that has always meant 2 ft.
    assertError('b = 6 [in]; c = b > 8', /Unit mismatch: in ≠ no unit/);
    assertError('b = 6 [in]; c = b < 8', /Unit mismatch/);
  });

  await t.step('a literal zero carries no dimension, so it compares against anything', () => {
    assertValue('b = 6 [in]; c = b > 0', 1, '');
    assertValue('M = -3 [in*kip]; c = M < 0', 1, '');
    assertValue('P = 180 [kip]; c = P != 0', 1, '');
  });

  await t.step('a comparison is flagged isTest, so it can render as OK / NG not 1 / 0', () => {
    // The renderer keys off this flag; without it a check shows a bare 1 or 0 (2.3.22).
    assertEquals(last('P = 180 [kip]; c = P >= 100 [kip]').isTest, true);
    assertEquals(last('c = 2 == 2').isTest, true);
    assertEquals(last('P = 180 [kip]; x = P * 2').isTest, undefined); // ordinary maths is not
    assertEquals(last('x = 1').isTest, undefined);
  });

  await t.step('a trailing unit never labels a pass/fail (the 2.3.10 fix)', () => {
    assertValue('P = 180 [kip]; c = P != 0 [kip]', 1, '');
    assertValue('P = 180 [kip]; c = P >= 100 [kip]', 1, '');
    assertValue('P = 180 [kip]; c = P >= 500 [kip]', 0, '');
  });
});

Deno.test('constants and variable names', async (t) => {
  await t.step('pi is available plain and marked', () => {
    assertValue('x = pi', Math.PI);
    assertValue('y = \\pi', Math.PI);
  });

  await t.step('Euler is the function exp(), and e belongs to the user', () => {
    assertValue('x = exp(1)', Math.E);
    assertValue('e = 0.5 [in]; P = 10 [kip]; M = P * e', 5, 'in·kip');
  });

  await t.step('a constant cannot be assigned', () => {
    assertError('pi = 3', /constant/);
    assertError('\\pi = 3', /constant/);
  });

  await t.step('tau is an ordinary variable (shear stress)', () => {
    assertValue('\\tau = 12 [ksi]; x = \\tau * 2', 24, 'kip/in^2');
  });

  await t.step('the display backslash never changes identity', () => {
    assertValue('\\phiM_n = 5; y = phiM_n + 1', 6);
    assertValue('\\phi\\alpha\\beta = 2; y = phialphabeta * 3', 6);
    assertValue('\\bar{x} = 3 [in]; y = xbar * 2', 6, 'in');
    assertValue('\\ell_b = 12 [ft]; y = ell_b', 12, 'ft');
  });

  await t.step('section dot notation resolves, including with a marked name', () => {
    assertValue('beam1__L = 12 [ft]; x = beam1.L', 12, 'ft');
    assertValue('beam1__phi_M = 0.9; x = beam1.\\phi_M', 0.9);
  });
});

Deno.test('functions', async (t) => {
  await t.step('logarithms — log is natural, log(x, base) is explicit', () => {
    assertValue('x = ln(exp(3))', 3);
    assertValue('y = log(exp(1))', 1);
    assertValue('z = log10(1000)', 3);
    assertValue('w = log(50, 2)', 5.6438561898, '', 1e-8);
    assertError('e = log(5, 1)', /base/);
    assertError('e = log(5 [in], 2)', /dimensionless/);
  });

  await t.step('trig takes radians or an angle unit (2.3.13)', () => {
    assertValue('x = sin(30 [deg])', 0.5);
    assertValue('t = 30 [deg]; y = cos(t)', 0.8660254038, '', 1e-9);
    assertValue('z = tan(45 [deg])', 1);
    assertValue('w = sin(\\pi/2)', 1);
    assertValue('v = sin(radians(30))', 0.5);
    assertValue('u = degrees(asin(0.5))', 30);
    assertValue('s = degrees(0.5 [rad])', 28.6478897565, '', 1e-8);
    assertError('e = sin(3 [ft])', /angle/);
  });

  await t.step('min and max take any count, or one vector', () => {
    assertValue(
      'D = 20 [kip]; L = 35 [kip]; W = 28 [kip]; m = max(1.4*D, 1.2*D + 1.6*L, 0.9*D + 1.0*W)',
      80,
      'kip',
    );
    assertValue('m = min(3, 9, 2, 7)', 2);
    assertValue('F = {12 [kip], -30 [kip], 8 [kip]}; m = max(F)', 12, 'kip');
    assertValue('F = {12 [kip], -30 [kip], 8 [kip]}; m = min(F)', -30, 'kip');
    assertError('m = max(1 [kip], 5 [in])', /Unit mismatch/);
  });

  await t.step('rounding to decimals and to a step', () => {
    assertValue('x = round(1.23456, 2)', 1.23);
    assertValue('d = 0.7381 [in]; x = roundup(d, 0.0625 [in])', 0.75, 'in');
    assertValue('d = 0.7381 [in]; x = rounddown(d, 0.0625 [in])', 0.6875, 'in');
    assertValue('d = 0.7381 [in]; x = round(d, 0.125 [in])', 0.75, 'in');
    assertValue('x = roundup(7.2)', 8);
    assertValue('x = rounddown(7.8)', 7);
    assertError('d = 1 [in]; x = roundup(d, 0 [in])', /greater than zero/);
  });

  await t.step('interpolation between two points and down a table', () => {
    assertValue('x = interp(15, 10, 100, 20, 200)', 150);
    assertValue('x = interp(15 [ft], 10 [ft], 100 [psf], 20 [ft], 200 [psf])', 150, 'lbf/ft^2');
    assertValue('x = interp(25, 10, 100, 20, 200)', 250); // extrapolates, by design
    const table = 'H = {0 [ft], 15 [ft], 20 [ft], 25 [ft]}; Kz = {0.57, 0.85, 0.90, 0.94}; ';
    assertValue(table + 'x = interp(17.5 [ft], H, Kz)', 0.875);
    assertValue(table + 'x = interp(15 [ft], H, Kz)', 0.85);
    assertError(table + 'x = interp(30 [ft], H, Kz)', /outside the table/);
    assertError('x = interp(5, {3, 1, 2}, {1, 2, 3})', /must increase/);
    assertError('x = interp(5, {1, 2}, {1, 2, 3})', /X has 2 values/);
  });

  await t.step('assorted built-ins keep their unit rules', () => {
    assertValue('x = sqrt(16 [in^4])', 4, 'in^2');
    assertValue('x = abs(-3 [kip])', 3, 'kip');
    assertValue('x = clamp(12, 0, 10)', 10);
    assertValue('x = if(2 > 1, 5 [kip], 9 [kip])', 5, 'kip');
    assertValue('x = hypot(3, 4)', 5);
    assertValue('x = mod(7, 3)', 1);
    // sin(1) + 1 is a plain number, so the trailing tag DECLARES — it is not a conversion.
    assertValue('x = sin(1) + 1 [ft]', 1.8414709848, 'ft', 1e-9);
  });
});

Deno.test('user functions and control flow', async (t) => {
  await t.step('a function definition converts its output on every call', () => {
    assertValue('f(x) = x * 12 [in/ft] [[ft]]; y = f(2 [ft])', 2, 'ft'); // tag stays with the body
  });

  await t.step('if / elseif / else pick one branch', () => {
    const lines = ['x = 5', 'if x > 10', 'y = 1', 'elseif x > 3', 'y = 2', 'else', 'y = 3', 'end'];
    assertEquals(rowsValue(lines, 'y'), 2);
  });

  await t.step('a for loop accumulates', () => {
    assertEquals(rowsValue(['S = 0', 'for i = 1 to 4', 'S = S + i', 'end'], 'S'), 10);
  });

  await t.step('a matrix cannot stand in for a number in control flow', () => {
    const r = rows(['A = {{1}}', 'if A', 'y = 1', 'end']);
    assertMatch(r[1].error ?? '', /single value/);
  });
});

/** Run formula rows in a fresh scope and read one variable out of it. */
function rowsValue(lines: string[], name: string): number {
  const scope: Scope = {};
  rows(lines, scope);
  return scope[name]?.v ?? NaN;
}
