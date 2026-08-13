# Testing — the honest state

**There is no automated test suite.** No `*_test.ts`, no `deno task test`, no CI test job. Verified
2026-08-13.

What exists:

| Mechanism                                   | What it actually catches                                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deno task check` (`deno fmt && deno lint`) | Formatting drift, unused imports/vars (errors, not warnings), `no-explicit-any` without a suppression, other `recommended`-tag lints. **Not** correctness. |
| `deno bundle` during `build`/`dev`          | Type errors and unresolved imports.                                                                                                                        |
| **Jon, in the browser**                     | Everything else.                                                                                                                                           |

## Why this matters more here than in most projects

`src/expr.ts` is 960 lines of dimensional analysis. Its failure mode is not a crash — it is **a number
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

**Functions and control flow**

- [ ] `delta(x) = expr [[in]]` — conversion applies on **every** call, including inside a plot.
- [ ] An `if` block and a `for` block each evaluate and render.

**Plot**

- [ ] Plot from `0` to `l [ft]` — sweep variable carries `ft`; a polynomial mixing `l` and `x`
      evaluates instead of erroring.
- [ ] Area fill on/off; markers render; crosshair tracks.

**Sections**

- [ ] Create, rename (collision reverts), collapse/expand — height is correct after toggle.
- [ ] Section-scoped variable resolves as `<name>__var`.
- [ ] A Summary block inside a section drives the section summary; a Formula block does not.

**Persistence and encryption** (the invariant — see [`security-model.md`](security-model.md))

- [ ] Save a project containing an owned pack section, then **grep the saved `.json` for a known
      plaintext string from the template. It must not appear.**
- [ ] Reload that project — content decrypts and renders.
- [ ] Open the same file signed in as a different account — renders the not-owned placeholder, not
      the content.

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

## If tests are ever added

Start with `expr.ts`. It is the highest-value, easiest-to-test module in the codebase: pure functions
in, `Quantity` out, no DOM. A table-driven `Deno.test` over `evalExpr(src, scope)` with expected
`{value, unit}` pairs would cover the unit algebra, compound expansion, `[[targetUnit]]`, and affine
temperature in a few hundred lines — and would retire the largest risk in the project. `unit-defs.ts`
is the natural second (round-trip every unit through `toBase`/`fromBase`).
