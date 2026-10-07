// ---------------------------------------------------------------------------
// One kind of quantity, spelled two ways, collapses to one symbol
// ---------------------------------------------------------------------------
// `kip` and `lbf` are the same dimension, so `1 [kip] / 1 [lbf]` is the pure number 1000. The
// engine used to leave it as `1 kip/lbf` — self-consistent, because the symbols still carried
// the scale factor, but unreadable. A square root is where it turned dangerous: an embedded-pier
// rotation depth of 5.77 ft came out of `sqrt(2*F/k + …)` displaying as
// `0.1826 ft·kip^0.50/lbf^0.50`, and on an engineering sheet that reads as 0.18 ft.
//
// So * / and the powers collapse each category onto one representative symbol and fold the
// difference into the value. A category spelled only one way must be left alone — `kip*ft` is
// what the author wrote and what they want to see.

import { assertAlmostEquals, assertEquals } from '@std/assert';
import { last } from './_helpers.ts';

Deno.test('same-dimension unit ratios collapse', async (t) => {
  await t.step('a ratio of two force units is a plain number', () => {
    const r = last('1[kip]/1[lbf]');
    assertEquals(r.unit, '');
    assertAlmostEquals(r.value, 1000, 1e-9);
  });

  await t.step('the surviving dimension keeps its unit', () => {
    const r = last('1[kip]*1[ft^2]/1[lbf]');
    assertEquals(r.unit, 'ft^2');
    assertAlmostEquals(r.value, 1000, 1e-9);
  });

  await t.step('a square root no longer invents a fractional unit', () => {
    const r = last('sqrt(1[kip]*1[ft^2]/1[lbf])');
    assertEquals(r.unit, 'ft');
    assertAlmostEquals(r.value, Math.sqrt(1000), 1e-9);
  });

  await t.step('and the result still adds to a plain length', () => {
    const r = last('sqrt(1[kip]*1[ft^2]/1[lbf])+1[ft]');
    assertEquals(r.unit, 'ft');
    assertAlmostEquals(r.value, Math.sqrt(1000) + 1, 1e-9);
  });

  await t.step('the larger exponent wins the representative', () => {
    // kip^2/lbf = (1000 lbf)^2 / lbf = 1e6 lbf, and 1e6 lbf reads as 1000 kip.
    const r = last('1[kip^2]/1[lbf]');
    assertEquals(r.unit, 'kip');
    assertAlmostEquals(r.value, 1000, 1e-9);
  });

  await t.step('an in/ft slope reduces to radians, not in^2/ft^2', () => {
    const r = last('1[kip*ft^2]/(1[ksi]*1[ft^4])');
    assertEquals(r.unit, '');
    // kip*ft^2 / (ksi*ft^4) = 1/(ksi*ft^2) * kip = 1 / (1[ksi]/1[ksf]) / 1 = 1/144
    assertAlmostEquals(r.value, 1 / 144, 1e-12);
  });

  await t.step('a category spelled one way is untouched', () => {
    assertEquals(last('2[kip]*3[ft]').unit, 'ft·kip');
    assertEquals(last('6[kip]/2[ft]').unit, 'kip/ft');
    assertEquals(last('sqrt(4[ft^2])').unit, 'ft');
  });

  await t.step('an offset scale is never folded into a ratio', () => {
    // degF carries an offset, so degF/degC is not a scale factor. It must not silently become one.
    const r = last('1[degF]/1[degC]');
    assertMatchOrUnit(r);
  });
});

/** The temperature ratio may error or stay uncollapsed — it must not become a bare number. */
function assertMatchOrUnit(r: { value: number; unit: string; error?: string }) {
  if (r.error) return;
  assertEquals(r.unit !== '', true, `degF/degC collapsed to a plain ${r.value}`);
}
