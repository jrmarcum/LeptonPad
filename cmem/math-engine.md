# Math Engine — `src/expr.ts`

960 lines of TypeScript. This is the product's differentiator: not that it evaluates expressions, but
that **every value carries units and the units are checked**.

## Core types

```ts
type UnitMap = Readonly<Record<string, number>>; // { kip: 1, in: -2 }
interface Quantity {
  value: number;
  unit: UnitMap;
}
type Scope = Record<string, Quantity>;
type FnScope = Record<string, { param: string; expr: string; targetUnit?: UnitMap }>;
```

`state.globalScope` and `state.globalFnScope` are the shared instances. Formula blocks evaluate in
document order into them, which is why an edit high on the sheet re-flows everything below it.

## Unit algebra

Private helpers, all pure, all operating on `UnitMap`:

| Fn              | Rule                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| `cleanU`        | Drops zero exponents — the canonical form. Always run before comparing.                   |
| `mulU` / `divU` | Add / subtract exponents.                                                                 |
| `powU`          | Multiply exponents by `n`.                                                                |
| `eqU`           | Structural equality after cleaning.                                                       |
| `addU`          | **Requires `eqU`** — addition and subtraction of mismatched units is an error, by design. |
| `formatUnit`    | `UnitMap` → display string.                                                               |

## Compound-unit expansion — the central design decision

`parseUnitExpr()` expands compound units into their primitive components using each `UnitDef`'s
`baseUnits` field. `E = 29000 [ksi]` is stored internally as `{kip: 1, in: -2}`.

**Why:** so `E * I [in^4]` cancels correctly to `kip·in²` instead of accumulating a meaningless
`ksi·in⁴`. Without expansion, unit cancellation across compound units simply does not work.

**Side effect (expected, correct, do not "fix"):** intermediate results display the **expanded** form
— `kip/in²`, not `ksi`. Users see this and it is right. Units that expand: `psi`, `ksi`, `psf`, `ksf`,
`Pa`, `kPa`, `MPa`, `GPa`, `J`, `kJ`, `MJ`, `W`, `kW`, `MW`, plus the torque, velocity, acceleration,
density, and momentum compound ids.

`baseUnits` is only defined when `1 [unit] = 1 [product of base units]` **exactly**, so expansion
never changes the numeric value — only the bookkeeping.

## `[unit]` vs `[[targetUnit]]` — the syntax users care about

| Syntax                   | Effect                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `x = 150 [mm]`           | **Declares** the unit. No numeric conversion; labels the result and feeds dimensional analysis. |
| `x = F [kN] [[lbf]]`     | **Converts** the result to `lbf`. `x` is then stored in `lbf` for everything downstream.        |
| `delta(x) = expr [[in]]` | Function definition — the conversion is applied **on every call**, not at definition time.      |

### Inline `[unit]` tags (v2.2.3, 2026-09-21)

Before 2.2.3 only **one trailing** `[unit]` was recognised; `evalStatements` stripped it and the lexer
threw `Unknown character '['` on any other bracket — so `d_hole = d_bolt + 0.0625 [in] + 0.0625 [in]`
failed. Now:

- The lexer emits a `UNIT` token for `[...]`; `[[` mid-expression throws "must be at the end".
- Grammar gained `tagged → power (UNIT ('^' power)?)?`, sitting between `addend` and `power`, so
  `x^2 [in^2]` tags `x^2` (not the exponent) and `3 [in]^2` = `9 in²`. A tag **declares** (overrides)
  the unit; it never converts.
- **Backward-compat rule:** `evalStatements` strips the trailing tag as a whole-result override **only
  when it is the sole tag** (`!stmt.slice(0, idx).includes('[')`). With several tags, all stay inline.
  `prettifyExpr` applies the identical rule so display and evaluation agree.
- ⚠️ **Accepted legacy trap:** a single trailing tag still relabels without converting —
  `d_bolt [in] + 1 [mm]` written as `d_bolt + 1 [mm]` gives `1.75 mm`. Changing it would change every
  existing `A = b*h [mm^2]` sheet, so it was left; `addU` stays strict for the inline form.

### Greek letters and `\sqrt` — the display-only backslash (v2.2.5, 2026-09-21)

**The backslash is mandatory for symbols and display-only.** `\phi` → φ, `\Delta` → Δ, `\sqrt(` → √(;
bare `phi` / `sqrt` render exactly as typed. `stripGreekMarks()` (exported from `expr.ts`) removes any
`\` before a letter in `lex()`, `evalStatements()` (the `raw` field keeps it for display) and
`parseForHeader()` — so `\phiM_n`, `\phi\alpha\beta` and `phiM_n`, `phialphabeta` are the same
variables. Rendering lives in `transformPiece()` (`src/utils/markdown.ts`): `GREEK_SYM` (all 24
letters, both cases) → `GREEK_MARK_RE` (longest name first) → `GREEK_SUB_RE`, whose bases and
subscripts accept Greek code points so `\phi_c` and `M_\phi` subscript correctly.

History: 2.2.3 briefly auto-converted a Greek name followed by a capital (`phiM_n` → φM<sub>n</sub>)
with `\` as an optional override. Jon made `\` mandatory in 2.2.5 "so there is absolutely no
confusion" — see [`design-decisions.md`](design-decisions.md). Existing sheets were deliberately
**not** migrated; they show plain names until edited.

### Hand-written project JSON and backslashes

`parseProjectJson()` (`src/persistence.ts`) is used by every file-open path (Load Project, New from
Template, Import Tools). If `JSON.parse` fails it retries once with every backslash that is not a
valid JSON escape doubled — including `\u` not followed by four hex digits (`\upsilon`). A file that
already parses is never altered. **It cannot fix `\b \f \n \r \t`** — `\beta`, `\nu`, `\rho`, `\tau`,
`\theta` are valid escapes that silently become control characters; the formula then errors (the lexer
rejects the control char or the name is undefined) rather than yielding a wrong number. Files saved
by LeptonPad itself are always correctly escaped by `JSON.stringify`.

`applyTargetUnit(q, targetUmap)` does the work, via `unitMapSiFactor()` — each side is reduced to its
SI factor and the ratio is the multiplier. That is how `F/A [N/mm^2] [[psi]]` converts through the
shared SI base (Pa) without either side knowing about the other.

**Affine temperature is special-cased.** `isSingleTempUnit()` detects a bare `C`/`F`/`R`/`K`, and only
then is the `offset` applied — so `20 [C] [[F]]` gives `68 °F`. A temperature appearing inside a
compound unit is treated as a scale factor only; applying the offset there would be wrong.

### `targetUnit` on function definitions — how it actually works

`FnScope` stores `targetUnit?: UnitMap` alongside `param` and `expr`. **Both call sites in
`Parser.atom()`** apply `applyTargetUnit()` after evaluating the function body. If you add a third
call path for user functions, it must apply it too — otherwise `delta(x) = expr [[in]]` silently
returns unconverted values on that path.

## Parser

- `lex(src)` → `Tok[]`. Recursive-descent `Parser` class with `private pos`; `atom()` handles
  literals, identifiers, scope lookups, function calls, parentheses, and unit annotations.
- Built-in special functions include `_gamma(z)` and `_erf(x)` — hand-rolled numeric approximations,
  since neither is in the JS standard library.
- `evalExpr(src, scope, fnScope)` → single `Quantity`.

## Statements and control flow

Above the expression layer:

- `evalStatements(src, scope, fnScope)` → `Statement[]` — multi-line evaluation.
- `parseRowsToAST()` builds a small AST over rows; `parseForHeader()` handles `for` headers;
  `execNodes()` executes it. `CTRL_TYPES` is the exported set of control keywords.
- `evalFormulaRows()` is the entry point formula blocks call — it returns `FormulaRow[]` carrying
  both the value and what to render.

This is why a formula block is a **program**, not an expression: it can branch and loop, and each row
can define a variable, define a function, or just display a result.

## Invariants

1. **`addU` must stay strict.** Silently coercing mismatched units would turn a wrong calculation into
   a plausible-looking number. In this product that is the worst possible failure.
2. **`cleanU` before comparing.** `{in: 0}` and `{}` are the same unit; only `cleanU` makes that true.
3. **Expansion happens in `parseUnitExpr`, once.** Do not expand again downstream — exponents would
   double.
4. **`applyTargetUnit` never mutates its input.** `Quantity` values flow through the evaluator; an
   in-place edit corrupts a cached scope entry.
5. **Evaluation order is document order.** Any change here breaks existing user sheets.

## Related

- The catalog those units come from: [`units.md`](units.md).
- How results are turned into HTML (and the `transformUnit` trap): [`conventions.md`](conventions.md).
- Plot-block sweep-variable unit propagation: [`blocks.md`](blocks.md) and
  [`design-decisions.md`](design-decisions.md).
