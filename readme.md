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
- **Deploy**: static site from `dist/` (Vercel) + the API (Deno Deploy)

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

| Block     | Description                                                               |
| --------- | ------------------------------------------------------------------------- |
| Formula   | Live math evaluation with units, variables, control flow                  |
| Summary   | Formula block variant with green accent; surfaces key results             |
| Plot      | SVG curve plot with variable x-range, optional area fill, x and y markers |
| Figure    | Image block with paste or click-to-upload                                 |
| Text      | Markdown text block                                                       |
| Header    | Section heading                                                           |
| Section   | Collapsible container (pro+ only)                                         |
| Beam Def  | Beam deflection math block                                                |
| Sect Prop | Section properties math block                                             |

All blocks support drag-to-reposition on a snap grid. Formula, Summary, Plot, and Figure blocks have a **stretch-right** handle at the right edge; Plot and Figure also have a **stretch-down** handle at the bottom edge.

## User roles

| Role    | Access                                                    |
| ------- | --------------------------------------------------------- |
| `super` | Everything — all section creation, all packs, admin       |
| `pro`   | Create/edit section blocks + own purchased template packs |
| `demo`  | Same as pro, expires 30 days from trial start             |
| `free`  | Use purchased section template packs only                 |

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

| Syntax                   | Effect                                                                  |
| ------------------------ | ----------------------------------------------------------------------- |
| `x = 150 [mm]`           | Declares the unit of `x` — no numeric conversion, labels the result     |
| `x = F [kN] [[lbf]]`     | Converts the result to `lbf`; `x` is stored in `lbf` for downstream use |
| `delta(x) = expr [[in]]` | Function definition — output is converted to `in` on every call         |

`[[targetUnit]]` performs real numeric conversion using the unit catalog in `src/utils/unit-defs.ts`. It handles:

- **Simple scaling**: `200 [MPa] [[ksi]]` → `29.0 ksi`
- **Compound units**: `F/A [N/mm^2] [[psi]]` → converts via shared SI base (Pa)
- **Affine temperature**: `20 [C] [[F]]` → `68 °F` (offset applied correctly)
- **Propagated units**: if `l = 12 [ft]` then `x = l^2 [[in^2]]` converts `ft²` → `in²`

The plot block automatically propagates the unit of the range bound to the sweep variable, so `delta(x)` plotted from `0` to `l [ft]` evaluates with `x` in `{ft}` — keeping polynomials like `l^3 - 2·l·x² + x³` dimensionally consistent.

Compound units (pressure, energy, power, torque, etc.) are automatically expanded into their primitive components for dimensional analysis. For example, `E = 29000 [ksi]` is tracked internally as `kip/in²` so that `E * I [in^4]` correctly cancels to `kip·in²` rather than accumulating `ksi·in⁴`. Units that expand: `psi`, `ksi`, `psf`, `ksf`, `Pa`, `kPa`, `MPa`, `GPa`, `J`, `kJ`, `MJ`, `W`, `kW`, `MW`, and the torque/velocity/acceleration/density/momentum compound ids. Note: intermediate results display the expanded form (e.g. `kip/in²` instead of `ksi`).

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
