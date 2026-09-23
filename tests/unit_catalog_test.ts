// ---------------------------------------------------------------------------
// Unit catalog integrity
// ---------------------------------------------------------------------------
// These guard the catalog's internal consistency rather than any one calculation. They exist
// because a data-entry slip here does not crash — it silently produces a wrong unit, and every
// dimensional check downstream then agrees with it.

import { assertEquals } from '@std/assert';
import {
  CATEGORY_DIMENSION,
  UNIT_CATEGORIES,
  UNIT_CATEGORY_OF,
  UNIT_LOOKUP,
} from '../src/utils/unit-defs.ts';

const dimSig = (d: Readonly<Record<string, number>> | undefined) =>
  Object.entries(d ?? {}).sort().map(([k, v]) => `${k}${v}`).join('·');

Deno.test('unit catalog integrity', async (t) => {
  await t.step('no id is shared by two categories of DIFFERENT dimension', () => {
    // `UNIT_LOOKUP` is flat and first-category-wins, so a duplicate id makes the later entry
    // unreachable. Until 2026-09-23 `g` was both Grams (mass) and Standard Gravity
    // (acceleration): mass is declared first, so `0.4 [g]` in a seismic calc silently meant
    // 0.4 grams and standard gravity could not be written at all. Gravity is now `G`.
    const byId = new Map<string, string[]>();
    for (const cat of Object.values(UNIT_CATEGORIES)) {
      for (const u of cat.units) {
        if (!byId.has(u.id)) byId.set(u.id, []);
        byId.get(u.id)!.push(cat.id);
      }
    }
    const conflicts: string[] = [];
    for (const [id, cats] of byId) {
      if (cats.length < 2) continue;
      const sigs = new Set(cats.map((c) => dimSig(CATEGORY_DIMENSION[c])));
      // Sharing an id is tolerable when the dimension matches (in3 is volume and section
      // modulus, both L³). Sharing it across dimensions makes one of them unreachable.
      if (sigs.size > 1) conflicts.push(`${id}: ${cats.join(' vs ')}`);
    }
    assertEquals(conflicts, []);
  });

  await t.step('every category has a dimension, and every dimension a category', () => {
    // A category with no CATEGORY_DIMENSION entry cannot be compared, added or converted at all —
    // dimensionOf falls back to treating each of its symbols as its own dimension.
    const noDim = Object.keys(UNIT_CATEGORIES).filter((c) => !CATEGORY_DIMENSION[c]);
    const noCat = Object.keys(CATEGORY_DIMENSION).filter((c) => !UNIT_CATEGORIES[c]);
    assertEquals(noDim, []);
    assertEquals(noCat, []);
  });

  await t.step('every baseUnits key is itself a catalog unit', () => {
    // parseUnitExpr rejects an unknown unit the USER types, but baseUnits expansion writes its
    // keys straight into the UnitMap without that check — so a typo here would create exactly the
    // phantom unit that rejection exists to prevent.
    const bad: string[] = [];
    for (const cat of Object.values(UNIT_CATEGORIES)) {
      for (const u of cat.units) {
        for (const k of Object.keys(u.baseUnits ?? {})) {
          if (!UNIT_LOOKUP.has(k)) bad.push(`${cat.id}/${u.id} -> ${k}`);
        }
      }
    }
    assertEquals(bad, []);
  });

  await t.step('every unit resolves to a category', () => {
    const orphans = [...UNIT_LOOKUP.keys()].filter((id) => !UNIT_CATEGORY_OF.has(id));
    assertEquals(orphans, []);
  });
});
