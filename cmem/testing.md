# Testing — the honest state

**There is a test suite as of 2026-09-23** — `tests/`, run by `deno task test`, and **`deno task
check` now runs `fmt && lint && test`**, so a regression blocks a release the way a lint error does.
**79 steps across 5 files** at v2.3.27, all against the real engine (pure functions in, `Quantity`
out, no DOM).

| File                         | Covers                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `tests/_helpers.ts`          | `assertValue` / `assertError` / `matrixText` / `rows` — one readable line per case; `last()` expands dot notation first.           |
| `tests/expr_units_test.ts`   | Unit tags and `[[conversion]]`, order of operations, comparisons, constants, every built-in function, control flow.                |
| `tests/expr_matrix_test.ts`  | Literals, element-wise and scalar arithmetic, `.*`, transpose/det/inv/solve/el, the `noMatrix` guards, sum/prod/integral/findroot. |
| `tests/markdown_test.ts`     | The mandatory backslash, subscripts, exponents, comparisons, big operators, matrices, markdown structure, XSS URL.                 |
| `tests/formula_rows_test.ts` | `parseFormulaRows` round-trips, plus the **source guard** on `syncContent` described below.                                        |

**Every fixed bug has a case**, named after it: the `-x^2` precedence, `==` as a comparison, the
comparison's trailing unit, the phantom `1` unit, the singular determinant returning exactly 0, the
identity product with no 1e-16 dust, and the unclosed-bracket crash.

Writing the suite immediately found a new one: **a trailing unit tag on a function definition was
silently dropped** (`f(x) = x * 12 [in/ft]` computed without the in/ft). Fixed the same day.

**The unit-correctness series of 2026-09-23** is all pinned here too, including the numbers that
were wrong before: `1 [ft] > 1 [in]` was false, `6 [in] > 0.5 [ft]` was true, `5 [kip] [[in]]`
reported 875634 in, and `[ksii]` was accepted as a unit. Where a fix changed a behaviour a test had
pinned, the assertion was **rewritten to the new value rather than deleted**, so the change shows up
in the diff on purpose.

### The source guard

`syncContent()` rebuilds a formula block's rows from the DOM on every keystroke, so a field it
forgets is destroyed (§ 16 of [`known-issues.md`](known-issues.md)). There is no DOM in the runner,
so `formula_rows_test.ts` asserts on the **source** of that function — that it writes back every
optional `FormulaRow` field — after stripping comments, so a comment that merely mentions a field
cannot satisfy it. It is not a pretty test; it is the one that would have caught the bug.

What the rest of the toolchain still catches:

| Mechanism                          | What it actually catches                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `deno fmt && deno lint`            | Formatting drift, unused imports/vars (errors), `no-explicit-any`, other `recommended` lints. |
| `deno bundle` during `build`/`dev` | Type errors and unresolved imports.                                                           |
| **Jon, in the browser**            | Everything the DOM touches — blocks, drag, editing, layout, deploy.                           |

**What is still only eyeball-verified:** anything needing a DOM — block placement and drag, the text
block's editor, section layout, the plot's SVG and crosshair, persistence, and the service worker.
The manual checklist below covers those and stays the release gate for them.

## Why this matters more here than in most projects

`src/expr.ts` is 1,718 lines of dimensional analysis (2026-09-22). Its failure mode is not a crash — it is **a number
that is wrong and looks right**. A structural engineer stamping a calculation sheet is the consumer.
There is no regression net between a refactor of `mulU`/`addU`/`applyTargetUnit` and a wrong beam
deflection on someone's drawing.

**Therefore the verification bar on this project is explicit disclosure**: say what you changed, what
you exercised, and precisely what Jon needs to click to confirm. "It compiles" is not a result.

## Manual regression checklist — the risky subsystems

Run these after any change to `expr.ts`, `unit-defs.ts`, `markdown.ts`, `plot.ts`, or `persistence.ts`.

**Unit algebra**

- [ ] `x = 150 [mm]` — labels, does not convert.
- [ ] `200 [MPa] [[ksi]]` → `29.0 ksi` (simple scaling).
- [ ] `F/A [N/mm^2] [[psi]]` — compound conversion through the SI base.
- [ ] `20 [C] [[F]]` → `68 °F` — affine offset applied.
- [ ] `l = 12 [ft]` then `x = l^2 [[in^2]]` — propagated unit converts `ft²` → `in²`.
- [ ] `E = 29000 [ksi]`, `E * I [in^4]` → displays `kip·in²` (expanded form is **correct**).
- [ ] Mismatched addition (`1 [ft] + 1 [kg]`) still raises a visible error.
- [ ] A unit id that renders with a Greek-substitution collision: **`psi` stays `psi`, not `ψ`**.
- [ ] Same-kind conversion: `1 [ft] + 1 [in]` = `1.0833 ft`; `12 [in] + 1 [ft]` = `24 in`.
- [ ] `6 [in] > 0.5 [ft]` is **false** (they are equal) and `1 [ft] > 1 [in]` is **true**.
- [ ] `b = 6 [in]; b > 8` errors; `b > 0` does not; `5 [kip] [[in]]` errors.
- [ ] `[ksii]` errors with "did you mean ksi?" — and the rows **after** it still evaluate.

**Formula rows** (2026-09-23 features)

- [ ] Right-click a row → Line spacing 2.0 affects that row only; type in another row and it
      **stays** (the 2.3.20 regression). Right-click the block label → applies to every row.
- [ ] Alt+↑/↓ moves between rows in the same column; Alt+←/→ walks the columns and into the next
      row; Alt+← on the very first cell does **not** navigate the browser back.
- [ ] A comparison row shows green **OK** / red **NG**; an `if` row still shows `▶ true` / `▷ false`.
- [ ] A normal result is the same font and colour as the formula; `err` is red.
- [ ] The heading rule and the description/reference column rules are near-black, not pale grey.

**Functions and control flow**

- [ ] `delta(x) = expr [[in]]` — conversion applies on **every** call, including inside a plot.
- [ ] An `if` block and a `for` block each evaluate and render.
- [ ] `a == b`, `a <= b`, `f(x) == 3` evaluate (not read as assignments) and display as = ≤.
- [ ] `sum(i^2, i, 1, 10)` = 385; `integral(sin(x), x, 0, \pi)` = 2; both draw Σ / ∫ with limits.
- [ ] `log(8, 2)` = 3 and `ln(exp(1))` = 1; `log(x)` is still the natural log.

**Notation (mandatory backslash)**

- [ ] `\phi_ty` renders φ<sub>ty</sub>; bare `phi_ty` renders as typed.
- [ ] `\ell_b`, `\bar{y}_c`, `\varphi` render ℓ<sub>b</sub>, ȳ<sub>c</sub>, ϕ.
- [ ] `exp(2)` = 7.389 and renders as e²; plain `e` is a free variable (`e = 0.5 [in]`, `P * e`).
- [ ] `-2^2` = −4 (minus binds looser than `^`); `exp(-x/2)` renders raised, not as `^`.
- [ ] Text size and Sub/superscript in the sidebar change rendered math, including ∫/Σ/Π limits.

**Matrices** (all through the formula-block path, with every matrix defined in the same block)

- [ ] `{{1, 2}, {3, 4}}` draws a bracketed grid; `{1, 2, 3}` is a **column**.
- [ ] Element-wise `A + B`, `A * B`; `2 * A`; `A .* B` (2×3 .* 3×2 works, 2×3 .* 2×2 errors).
- [ ] `K = {{12 [kip/in], -6 [kip]}, {-6 [kip], 4 [kip*in]}}`, `F = {5.94 [kip], -2.96 [kip*in]}`:
      `solve(K, F)` = [0.5 in; 0.01], `K .* solve(K, F)` returns F, `det(K)` = 12 kip²,
      `inv(K)` is a flexibility matrix, `el(u, 1, 1)` = 0.5 in.
- [ ] `K .* inv(K)` reads as a clean identity (no 1e-16 dust).
- [ ] Anything unsupported errors instead of showing NaN: `sqrt(A)`, `A^2`, `A >= B`, `A + 1`,
      `2 / A`, `A [[mm]]`, an `if` condition on a matrix, a plot of a matrix.

**Plot**

- [ ] Plot from `0` to `l [ft]` — sweep variable carries `ft`; a polynomial mixing `l` and `x`
      evaluates instead of erroring.
- [ ] Area fill on/off; markers render; crosshair tracks.

**Sections**

- [ ] Create, rename (collision reverts), collapse/expand — height is correct after toggle.
- [ ] Section-scoped variable resolves as `<name>__var`.
- [ ] A Summary block inside a section drives the section summary; a Formula block does not.
- [ ] A Summary block places inside a section (drag and double-click); dropped on the open sheet it
      shows the "Summary blocks go inside a Section" message; a free user gets the Pro dialog.
- [ ] With the title block on and 3+ pages, Shift+Enter on page 1 pushes content down but every
      page's title block stays pinned to its page top; rubber-band and right-click never select one.

**Persistence and encryption** (the invariant — see [`security-model.md`](security-model.md))

- [ ] Save a project containing an owned pack section, then **grep the saved `.json` for a known
      plaintext string from the template. It must not appear.**
- [ ] Reload that project — content decrypts and renders.
- [ ] Open the same file signed in as a different account — renders the not-owned placeholder, not
      the content.

**Project open / new**

- [ ] With a multi-page project open and the cursor on a late page, **New Project** (and loading a
      one-page file) puts the grid cursor back on page 1 and scrolls the canvas to the top.

**Build/deploy**

- [ ] After a version bump + build, `dist/sw.js` carries the new `leptonpad-vX.Y.Z`.
- [ ] Reload with an existing cache (not a hard refresh) — new bundle is served.

## Backend regression check — run this against Neon after any `db/schema.sql` change

No browser and no Clerk required: connect with the `@neon/serverless` driver and exercise the chain
with two fake user ids and a throwaway pack, then delete the test rows. Ten assertions:

| #  | Assertion                                                                                  |
| -- | ------------------------------------------------------------------------------------------ |
| 1  | Unknown user → `role: 'free'`, `pack_ids: []` — **an empty ARRAY, not the string `"{}"`**  |
| 2  | Non-owner calling `get_pack_key` gets `null`                                               |
| 3  | `mint_license_codes` emits `XXXX-XXXX-XXXX-XXXX`                                           |
| 4  | `redeem_license_code` succeeds once                                                        |
| 5  | The same code redeemed twice fails the second time                                         |
| 6  | **A pack owner with NO `user_roles` row still lists the pack** — the 2026-08-13 regression |
| 7  | Owner's key decodes to exactly 32 bytes                                                    |
| 8  | The key is deterministic across calls                                                      |
| 9  | A different user gets a different key (or none)                                            |
| 10 | A `super` user bypasses ownership and gets a key that differs from the owner's             |

Assertions 1 and 6 exist because both failed the first time this was run. See
[`backend-migration.md`](backend-migration.md).

## Adding to the suite

**Rules that came out of writing it — follow them or the suite lies to you:**

1. **Every test string is self-contained.** Build the whole scope in the statement under test
   (`'K = {...}; F = {...}; u = solve(K, F)'`). Sharing a scope between cases is how a 2×3 ends up
   multiplied by a 2×2 and nine names come back undefined.
2. **Say whether a case is about the value or the display.** `assertValue` is the engine;
   `markdown_test.ts` is the rendering. Never assert one to check the other.
3. **Units are asserted in their expanded display form** — `ksi` reads back as `kip/in^2`, `psi` as
   `lbf/in^2`. That expansion is correct behaviour, not a bug to work around.
4. **Assert the error text, not just that it failed** — `assertError(src, /can't be added/)`. A
   regex that matches a message the engine no longer produces silently passes for the wrong reason,
   so copy the wording from the source.
5. **When a behaviour is disputed, pin the current one with a comment saying so**, as the trailing-
   unit case in `expr_units_test.ts` does. Then the change shows up in the diff on purpose.

**Where to extend next:** `unit-defs.ts` (round-trip every unit through `toBase`/`fromBase` and
assert no definition is unreachable), then `persistence.ts` (`parseProjectJson` on malformed input —
it already has repair logic with no coverage).
