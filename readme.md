# LeptonPad

A browser-based engineering calculation pad PWA. Users build calculation sheets by dragging and dropping blocks onto a canvas. Blocks support live math evaluation, plots, figures, and structured section templates.

## Stack

- **Runtime**: Deno 2.x
- **Build**: `deno bundle --platform browser` → `dist/main.js`
- **Math**: TypeScript — `src/expr.ts` handles units, dimensional analysis, and control flow
- **Solver**: three arithmetic functions compiled to WASM (`solver/solver.ts` → `dist/solver.wasm`)
- **Auth**: Clerk (email + password)
- **Database**: Neon Postgres, reached only through a small API (`api/main.ts`) on Deno Deploy
- **Encryption**: Web Crypto API (AES-256-GCM) for purchased section template protection
- **Deploy**: one Deno Deploy project serves the static site from `dist/` and the API — pushing
  `main` deploys to https://leptonpad.com

## Development

```bash
deno task dev       # hot-reload dev server at http://localhost:5173
deno task api:dev   # the entitlement API at http://localhost:8000 (run in a second terminal)
deno task build     # production build → dist/
deno task serve     # serve dist/ locally
deno task db:check  # regression-test the entitlement chain against Neon
deno task promote   # list accounts; `promote <email> [role]` grants a role
```

Signing in, roles, and template packs need `api:dev` running alongside `dev`. Everything else — the
canvas, the math engine, plots, saving and loading — works without it.

Version is controlled by the `"version"` field in `deno.json`. Running `build` or `dev` automatically syncs it into `dist/config.js` and the service worker cache name — bumping `deno.json` is the only manual step for a release.

Configuration lives in two gitignored files, created from the committed templates:

```bash
cp .env.example .env          # browser: CLERK_PUBLISHABLE_KEY, LP_API_URL
cp .env.api.example .env.api  # API: DATABASE_URL, CLERK_JWT_KEY or CLERK_SECRET_KEY, ALLOWED_ORIGINS
```

The `.example` files are documentation and are committed — never put a real value in one.

## Block types

| Block     | Description                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Formula   | Live math evaluation with units, variables, control flow                                                                            |
| Summary   | Section companion (pro+ only) — a green-accented formula block placed inside a Section; its results feed the section's summary line |
| Plot      | SVG curve plot with variable x-range, optional area fill, x and y markers                                                           |
| Figure    | Image block with paste or click-to-upload                                                                                           |
| Text      | Markdown text block                                                                                                                 |
| Header    | Section heading                                                                                                                     |
| Section   | Collapsible container (pro+ only)                                                                                                   |
| Beam Def  | Beam deflection math block                                                                                                          |
| Sect Prop | Section properties math block                                                                                                       |

All blocks support drag-to-reposition on a snap grid. Formula, Summary, Plot, and Figure blocks have a **stretch-right** handle at the right edge; Plot and Figure also have a **stretch-down** handle at the bottom edge.

## User roles

| Role    | Access                                                                |
| ------- | --------------------------------------------------------------------- |
| `super` | Everything — all section creation, all packs, admin                   |
| `pro`   | Create/edit section and summary blocks + own purchased template packs |
| `demo`  | Same as pro, expires 30 days from trial start                         |
| `free`  | Use purchased section template packs only                             |

## Key source files

| File                         | Purpose                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `src/main.ts`                | Entry point — sidebar, event wiring, keyboard handling         |
| `src/state.ts`               | All shared mutable state                                       |
| `src/types.ts`               | Shared TypeScript interfaces and constants                     |
| `src/expr.ts`                | Math evaluator — dimensional analysis, units, control flow     |
| `src/canvas.ts`              | Canvas class — DOM, snap grid, margin guide                    |
| `src/dnd.ts`                 | Drag-and-drop, block placement, selection                      |
| `src/backend.ts`             | The backend contract — the only place a vendor SDK is imported |
| `src/backends/neon-clerk.ts` | Clerk identity + bearer-JWT calls to the API                   |
| `src/auth.ts`                | Roles, pack ownership, offline cache                           |
| `src/persistence.ts`         | Project serialize/deserialize, load/save                       |
| `src/blocks/formula.ts`      | Formula block with live evaluation                             |
| `src/blocks/plot.ts`         | Plot block — SVG built in TypeScript                           |
| `src/blocks/figure.ts`       | Figure/image block                                             |
| `src/blocks/text.ts`         | Markdown text block                                            |
| `src/blocks/pro/section.ts`  | Section block — gated to pro+                                  |
| `src/utils/unit-defs.ts`     | Unit catalog — 22 categories, English + metric, SI factors     |
| `src/utils/units.ts`         | Unit conversion helpers and `convert()` function               |
| `src/utils/markdown.ts`      | Markdown and math-expression rendering                         |
| `src/styles/main.css`        | All application styles                                         |
| `public/index.html`          | HTML shell                                                     |
| `api/main.ts`                | Entitlement API — verifies Clerk JWTs, calls Neon              |
| `db/schema.sql`              | Complete Neon schema — tables, functions, admin helpers        |

## Formula block unit syntax

| Syntax                    | Effect                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| `x = 150 [mm]`            | Declares the unit of `x` — no numeric conversion, labels the result     |
| `d = a + 1 [in] + 2 [in]` | Inline tags — each `[unit]` applies to the term just before it          |
| `A = 3 [in]^2`            | A power after a tag applies to the tagged quantity (`9 in²`)            |
| `x = F [kN] [[lbf]]`      | Converts the result to `lbf`; `x` is stored in `lbf` for downstream use |
| `delta(x) = expr [[in]]`  | Function definition — output is converted to `in` on every call         |

When a statement has a **single** `[unit]` tag at the very end, it labels the whole result (so
`A = b*h [mm^2]` means the result is in mm²). When a statement has **several** tags, every tag —
including the last — applies only to the term right before it. `[[targetUnit]]` conversion must be
the last thing on the line.

`[[targetUnit]]` performs real numeric conversion using the unit catalog in `src/utils/unit-defs.ts`. It handles:

- **Simple scaling**: `200 [MPa] [[ksi]]` → `29.0 ksi`
- **Compound units**: `F/A [N/mm^2] [[psi]]` → converts via shared SI base (Pa)
- **Affine temperature**: `20 [C] [[F]]` → `68 °F` (offset applied correctly)
- **Propagated units**: if `l = 12 [ft]` then `x = l^2 [[in^2]]` converts `ft²` → `in²`

The plot block automatically propagates the unit of the range bound to the sweep variable, so `delta(x)` plotted from `0` to `l [ft]` evaluates with `x` in `{ft}` — keeping polynomials like `l^3 - 2·l·x² + x³` dimensionally consistent.

Compound units (pressure, energy, power, torque, etc.) are automatically expanded into their primitive components for dimensional analysis. For example, `E = 29000 [ksi]` is tracked internally as `kip/in²` so that `E * I [in^4]` correctly cancels to `kip·in²` rather than accumulating `ksi·in⁴`. Units that expand: `psi`, `ksi`, `psf`, `ksf`, `Pa`, `kPa`, `MPa`, `GPa`, `J`, `kJ`, `MJ`, `W`, `kW`, `MW`, and the torque/velocity/acceleration/density/momentum compound ids. Note: intermediate results display the expanded form (e.g. `kip/in²` instead of `ksi`).

## Variable names, Greek letters and symbols

**Variable names** start with a letter or `_` and may contain only letters, digits and `_`
(case-sensitive). An underscore marks a subscript in the display: `M_n` → M<sub>n</sub>,
`delta_1_2` → delta<sub>1,2</sub>. Avoid `__` in your own names — it is the section separator
(`beam1__L`, written `beam1.L`). `e` and `tau` are ordinary names — use them freely for
eccentricity and shear stress (`\tau`); only `pi` is reserved (see Constants below).

**Greek letters and √ are written LaTeX-style, with a backslash — it is required.** The backslash
only affects the display; the calculator removes it, so `\phiM_n` and `phiM_n` are the same
variable.

| You type            | Displays as    | Variable name    |
| ------------------- | -------------- | ---------------- |
| `\phi_ty`           | φ<sub>ty</sub> | `phi_ty`         |
| `\phiM_n`           | φM<sub>n</sub> | `phiM_n`         |
| `\phi\alpha\beta`   | φαβ            | `phialphabeta`   |
| `M_\phi`            | M<sub>φ</sub>  | `M_phi`          |
| `\Delta`, `\Omega`  | Δ, Ω           | `Delta`, `Omega` |
| `\ell_b`            | ℓ<sub>b</sub>  | `ell_b`          |
| `\varphi`           | ϕ              | `varphi`         |
| `\bar{x}`           | x̄              | `xbar`           |
| `\bar{y}_c`         | ȳ<sub>c</sub>  | `ybar_c`         |
| `\bar{\sigma}`      | σ̄              | `sigmabar`       |
| `\sqrt(A/\pi)`      | √(A/π)         | (calls `sqrt`)   |
| `phi_ty`, `sqrt(x)` | shown as typed | —                |

All 24 Greek letters are available in lower and upper case (`\alpha` … `\omega`, `\Alpha` …
`\Omega`), plus `\ell` (ℓ). Unit tags are never converted: `5 [psi]` always shows `psi`. The same
rules apply in plot labels and in `$...$` math inside text blocks.

**`\var` letters give the other shape of a letter:** `\varphi` ϕ, `\varepsilon` ϵ, `\vartheta` ϑ,
`\varsigma` ς, `\varrho` ϱ, `\varpi` ϖ, `\varkappa` ϰ. Note that LeptonPad's `\phi` (φ) and `\epsilon`
(ε) are the shapes real LaTeX draws for `\varphi` and `\varepsilon` — for those two the names are
swapped relative to LaTeX, so `\phi` keeps the curly φ used in AISC resistance factors.

**`\bar{…}`** puts a bar over one name — a letter or letters, or a symbol such as `\bar{\sigma}` — and
the variable is that name followed by `bar`. Other LaTeX (`\frac`, `\hat`, braces elsewhere) is not
supported.

**In hand-written or AI-generated project files**, JSON requires every backslash to be doubled:
`"\\phi_ty = 0.90"`. LeptonPad repairs single backslashes that JSON rejects (`\p`, `\a`, `\u…`)
when loading, but `\b`, `\f`, `\n`, `\r` and `\t` are valid JSON escapes and silently become
control characters — so `\beta`, `\bar{…}`, `\nu`, `\rho`, `\tau` and `\theta` must be written
doubled.

## Built-in functions and constants

| Kind        | Functions                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Logarithms  | `ln(x)` and `log(x)` = natural log · `log10(x)` · `log2(x)` · `log(x, base)` · `log1p(x)`         |
| Exponential | `exp(x)` · `expm1(x)` · `pow(x, n)` · `x^n`                                                       |
| Roots       | `sqrt(x)` · `cbrt(x)`                                                                             |
| Trig        | `sin` `cos` `tan` `asin` `acos` `atan` `atan2(y, x)` (radians) · `degrees(x)` · `radians(x)`      |
| Hyperbolic  | `sinh` `cosh` `tanh` `asinh` `acosh` `atanh`                                                      |
| Rounding    | `abs` `floor` `ceil` `round` `trunc` `sign` · `min(a, b)` `max(a, b)` `clamp(x, lo, hi)`          |
| Logic       | `if(cond, a, b)` · `and` `or` `xor` `not` · comparisons `==` `!=` `<` `>` `<=` `>=` (1 or 0)      |
| Other       | `mod(a, b)` · `hypot(a, b)` · `factorial` `gamma` `lgamma` `erf` `erfc` `comb(n, k)` `perm(n, k)` |

**Sums, products and integrals** take the expression, the variable, and the two limits:

| You type                        | Displays as                | Result               |
| ------------------------------- | -------------------------- | -------------------- |
| `sum(i^2, i, 1, 10)`            | Σ from i=1 to 10 of i²     | 385                  |
| `prod(1 + r, i, 1, n)`          | Π from i=1 to n of (1 + r) | (1 + r)ⁿ             |
| `integral(w(x), x, 0, L)`       | ∫ from 0 to L of w(x) dx   | total load, e.g. kip |
| `integral(w(x)*x, x, 0, L) / W` | stacked fraction           | centroid location    |

- `sum`/`prod` step the index by 1 over whole-number limits; an empty range gives 0 (sum) or 1 (prod).
- `integral` is numerical (adaptive Simpson's rule, ~10 significant figures for smooth functions).
  Units follow the math — a kip/ft load integrated over ft gives kip. The integrand must be finite
  across the whole range: `integral(1/x, x, 0, 1)` reports an error rather than a guess.
- They nest (`sum(sum(i*j, j, 1, 3), i, 1, 3)`) and work inside `for` loops and plots.

**Matrices** (in progress — step 1 of 3: element-wise operations) are written in braces, row by row:

| You type                                                | Means                                              |
| ------------------------------------------------------- | -------------------------------------------------- |
| `A = {{1, 2}, {3, 4}}`                                  | 2×2 matrix                                         |
| `u = {1, 2, 3}`                                         | column vector (3×1); a row vector is `{{1, 2, 3}}` |
| `K = {{12, -6}, {-6, 4}} [kip/in]`                      | every element in kip/in                            |
| `K = {{12 [kip/in], -6 [kip]}, {-6 [kip], 4 [kip*in]}}` | each element its own unit                          |
| `A + B`, `A - B`, `A * B`, `A / B`, `-A`                | element by element — same size required            |

Units are checked element by element, so adding kip to kip/in is an error that names the element.
Not yet available (they report an error, never a wrong number): number × matrix, matrix
multiplication `A .* B` (row-by-column), functions of a matrix, comparisons and `[[…]]` conversion.

**Comparisons display as symbols:** type `>=`, `<=`, `!=` (or `<>`) and `==`; they show as ≥, ≤, ≠
and =, including in `if`/`elseif` conditions, inside `if(…)`, in text-block math and in section
summary checks. A comparison splits the line first, so `f_a/F_a <= 1.0` shows as a fraction ≤ 1.0.

**Order of operations:** `^` binds tighter than a leading minus — `-x^2` is −(x²) and `-2^2` is −4,
as in Mathcad and MATLAB (Excel differs). Write `(-x)^2` for the square of −x.

**`log(x)` is the natural log (ln), not log₁₀** — use `log10(x)` for base-10 equations, or write
`ln(x)` to make intent obvious. For any other base, `log(x, base)`: log₂ 50 is `log(50, 2)`. Log,
trig and exponential arguments must be unitless — divide the unit out first, e.g. `ln(d / 1 [in])`.

**Constants** are marked with a backslash, so they can never be confused with your variables:

| You type       | Means                                                   |
| -------------- | ------------------------------------------------------- |
| `\e`           | Euler's number 2.71828… (`\e^2`, `\e^(-x)`)             |
| `\pi` or `pi`  | π 3.14159…                                              |
| `e`            | **your variable** — e.g. eccentricity `e = 0.5 [in]`    |
| `tau` / `\tau` | **your variable** — e.g. shear stress τ (2π is `2*\pi`) |

Plain `e` is never Euler's number — a sheet that uses `e` as 2.718… shows `Undefined: e` until it is
changed to `\e` (or `exp(x)`). `\e`, `\pi` and `pi` cannot be assigned; `\pi_1` or `\piR` are ordinary
names that merely display with π.

## Section template encryption

Purchased section templates are AES-256-GCM encrypted. The key is derived server-side as `HMAC-SHA256(pack_secret, user_id)` — unique to each buyer — and cached in `localStorage` for offline use. Only the ciphertext and IV are ever written to the project JSON; decrypted content is never persisted. Copying a project file does not transfer template access, because the key is tied to the user's account rather than to the file.

## Backend setup (one-time)

1. Create a **Neon** project, then run `db/schema.sql` against it. It needs `pgcrypto`, which Neon enables by default.
2. Create a **Clerk** application and enable email + password sign-in.
3. `cp .env.api.example .env.api` and fill in `DATABASE_URL`, `ALLOWED_ORIGINS` (include `http://localhost:5173`), and either `CLERK_JWT_KEY` (the PEM public key — verification stays local) or `CLERK_SECRET_KEY` (verification fetches Clerk's JWKS).
4. `cp .env.example .env` and fill in `CLERK_PUBLISHABLE_KEY` and `LP_API_URL`.
5. Deploy `api/main.ts` to **Deno Deploy** with the same variables as step 3.
6. Start the app, sign up, then grant yourself admin:

   ```bash
   deno task promote your@email.com
   ```

   The account has to exist in Clerk first — the user id is created at sign-up.

Verify the whole chain any time with `deno task db:check`.

## License codes

Year-based pro subscriptions and section-pack purchases use one-time codes. Format: `XXXX-XXXX-XXXX-XXXX`. Mint them with:

```sql
select * from mint_license_codes(10, 'pro', null, 365);   -- 10 annual pro codes
select * from mint_license_codes(5, null, 'beam-calc-v1', 0);  -- 5 perpetual pack codes
```

A code grants **either** a role (`pro` or `demo`) **or** a pack, never both — a database constraint enforces it, and no code can grant `super`. `valid_days = 0` means perpetual.

Create a pack, with its secret generated automatically:

```sql
select create_section_pack('beam-calc-v1', 'Beam Calculation Templates', 'Pre-built beam sections');
```
