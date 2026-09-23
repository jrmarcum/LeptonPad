# Unit Catalog — `src/utils/unit-defs.ts` + `src/utils/units.ts`

## Conversion model

```
toBase(x)   = x * factor + (offset ?? 0)
fromBase(b) = (b - (offset ?? 0)) / factor
```

`offset` is **non-zero only for the affine temperature scales** (°C, °F, °R). Every other unit in the
catalog has `offset = 0` and needs only `factor`. Keeping the offset in the model rather than
special-casing temperature at every call site is what makes `20 [C] [[F]] → 68 °F` fall out naturally.

## `UnitDef`

```ts
interface UnitDef {
  id: string; // unique within its category
  label: string; // human-readable name
  symbol: string; // display symbol — may carry unicode superscripts / middots
  factor: number; // multiply by this to get the SI base value
  offset?: number; // added after multiplying — temperature only
  system: 'metric' | 'english' | 'both';
  baseUnits?: Readonly<Record<string, number>>; // dimensional decomposition
}
```

**`baseUnits` is the compound-expansion hook.** It is defined **only** when
`1 [unit] = 1 [product of base units]` exactly, so expanding never changes the numeric value — only
the dimensional bookkeeping. `parseUnitExpr()` in `expr.ts` reads it. Adding `baseUnits` to a unit
where the identity does not hold exactly would silently corrupt every calculation using that unit.

## The 23 categories

`UNIT_CATEGORIES: Record<string, UnitCategory>`, each with an `siBase` symbol and a `units` array:

| #  | Category      | #  | Category                            |
| -- | ------------- | -- | ----------------------------------- |
| 1  | `length`      | 12 | `acceleration`                      |
| 2  | `area`        | 13 | `angle`                             |
| 3  | `volume`      | 14 | `momentum`                          |
| 4  | `mass`        | 15 | `angular_momentum`                  |
| 5  | `time`        | 16 | `angular_acceleration`              |
| 6  | `temperature` | 17 | `torque`                            |
| 7  | `force`       | 18 | `density`                           |
| 8  | `pressure`    | 19 | `area_moi` (area moment of inertia) |
| 9  | `energy`      | 20 | `mass_moi` (mass moment of inertia) |
| 10 | `power`       | 21 | `section_modulus`                   |
| 11 | `velocity`    | 22 | `warping_constant`                  |
|    |               | 23 | `forcePerUnitLength` (plf, klf)     |

The last four exist because this is a **structural engineering** tool: `area_moi`, `section_modulus`,
and `warping_constant` are not general-purpose unit categories, they are section-property units.

Every category carries **both English and metric** members; `system: 'both'` marks the units common
to each (e.g. dimensionless-ish or SI-adopted units). `unitsBySystem(category, system)` filters for
the UI pickers, and `UNIT_LOOKUP` is a flattened `ReadonlyMap<string, UnitDef>` built once at module
load for O(1) id resolution. **158 units** across the 23 categories as of 2026-09-23 (`kN-mm` was
the most recent addition; `J`, `lbm` and `kg` were already present when asked for).

## `CATEGORY_DIMENSION` — what makes "same kind?" answerable (2026-09-23)

A `factor` alone cannot tell you whether two units are comparable: `kip` and `in` both have one, so
factor scaling will cheerfully convert a force into a length. Two exports fix that:

- **`UNIT_CATEGORY_OF`** — unit id → category id (first category wins, as in `UNIT_LOOKUP`).
- **`CATEGORY_DIMENSION`** — category id → signature in primitive dimensions:
  **L** length, **M** mass, **T** time, **K** temperature, **A** angle. Force is not primitive; it
  is M·L·T⁻², which is what lets `[kg]*[G]` convert to `[N]`.

`expr.ts` composes them in `dimensionOf(UnitMap)`, and `sameKind()` compares the results. That is
what `+`, `−`, comparisons and `[[unit]]` all consult before converting.

**Force is derived: M·L·T⁻².** So `2 [kg] * 1 [G]` converts to `19.6133 N` and
`1 [slug] * 1 [ft_s2]` to exactly `1 lbf` — a newton _is_ kg·m/s². It was briefly primitive (`F`)
on the mistaken belief that this was what separated `lbf` from `lbm`; mass is `M` and force is
`M·L·T⁻²`, so they differ regardless. See [`design-decisions.md`](design-decisions.md).

Two categories may legitimately share a signature — `energy` and `torque` are both M·L²·T⁻², as J
and N·m are — and converting between them is valid. `volume` and `section_modulus` likewise share
L³. Those two pairs are the **only** shared signatures, which `tests/unit_catalog_test.ts` pins.

A symbol the catalog does not know becomes **its own dimension**, so an invented unit only ever
matches itself instead of converting into something real. That is a containment measure, not a
validation one: unknown tags are still accepted — see [`known-issues.md`](known-issues.md) § 17.

## Adding a unit — the checklist

1. Put it in the right category; `factor` converts **to that category's SI base**.
2. `system` — `'metric'`, `'english'`, or `'both'`. This drives the picker, not the math.
3. `symbol` is display-only and may contain unicode; `id` is what users type in `[...]` and must be
   ASCII and unique within the category.
4. Add `baseUnits` **only** if the unit-value identity is exact (see above) — **and only if the unit
   should lose its own name on screen.** A unit with `baseUnits` is expanded at parse time and can
   never display as itself again: that is right for `ksi` (so `E * I` cancels to `kip·in²`) and
   wrong for `J`, whose decomposition was removed in v2.3.30 because a joule should read as `J`.
   Since `CATEGORY_DIMENSION` exists, expansion is **no longer needed for cross-category
   conversion** — `dimensionOf` handles that — so add it only for cancellation, not compatibility.
5. Check the id does not collide across categories in `UNIT_LOOKUP` — the map is flat.
6. **Watch the Greek-substitution trap**: a unit id like `psi` or `rho` must render through
   `transformUnit()`, never `transformPiece()`. See [`conventions.md`](conventions.md).
7. **A new _category_ also needs a `CATEGORY_DIMENSION` entry**, or nothing of that kind can be
   compared, added or converted — `dimensionOf` falls back to treating each symbol as unique.
8. **Verify both directions and one cross-system case.** `kN-mm` was added with
   `1000 [kN-mm] → 1 kN·m`, `1 [kN-m] → 1000 kN·mm` and `50 [kN-m] → 36.8781 kip·ft`, then pinned
   in `tests/expr_units_test.ts`. A factor that is wrong by 10³ still looks plausible in isolation.

## `src/utils/units.ts`

45 lines: `convert()` plus small helpers. Several are annotated `// WASM-READY: (f64, …) -> f64` —
pure `f64` signatures with no state access, marked as candidates for promotion to WASM via `wasmtk`.
**They are not compiled today**, and per [`design-decisions.md`](design-decisions.md) they probably
should not be: a lookup plus one multiply does not pay for a JS↔WASM boundary crossing.
