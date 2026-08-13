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

## The 22 categories

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

The last four exist because this is a **structural engineering** tool: `area_moi`, `section_modulus`,
and `warping_constant` are not general-purpose unit categories, they are section-property units.

Every category carries **both English and metric** members; `system: 'both'` marks the units common
to each (e.g. dimensionless-ish or SI-adopted units). `unitsBySystem(category, system)` filters for
the UI pickers, and `UNIT_LOOKUP` is a flattened `ReadonlyMap<string, UnitDef>` built once at module
load for O(1) id resolution.

## Adding a unit — the checklist

1. Put it in the right category; `factor` converts **to that category's SI base**.
2. `system` — `'metric'`, `'english'`, or `'both'`. This drives the picker, not the math.
3. `symbol` is display-only and may contain unicode; `id` is what users type in `[...]` and must be
   ASCII and unique within the category.
4. Add `baseUnits` **only** if the unit-value identity is exact (see above).
5. Check the id does not collide across categories in `UNIT_LOOKUP` — the map is flat.
6. **Watch the Greek-substitution trap**: a unit id like `psi` or `rho` must render through
   `transformUnit()`, never `transformPiece()`. See [`conventions.md`](conventions.md).

## `src/utils/units.ts`

45 lines: `convert()` plus small helpers. Several are annotated `// WASM-READY: (f64, …) -> f64` —
pure `f64` signatures with no state access, marked as candidates for promotion to WASM via `wasmtk`.
**They are not compiled today**, and per [`design-decisions.md`](design-decisions.md) they probably
should not be: a lookup plus one multiply does not pay for a JS↔WASM boundary crossing.
