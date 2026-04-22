# LeptonPad

A browser-based engineering calculation pad PWA. Users build calculation sheets by dragging and dropping blocks onto a canvas. Blocks support live math evaluation, plots, figures, and structured section templates.

## Stack

- **Runtime**: Deno 2.x
- **Build**: `deno bundle --platform browser` → `dist/main.js`
- **Solver**: TypeScript math kernel compiled to WASM (`src/solver/`)
- **Auth / DB**: Supabase (email+password, PostgreSQL, RLS, Edge Functions)
- **Encryption**: Web Crypto API (AES-256-GCM) for purchased section template protection
- **Deploy**: Static site served from `dist/` (Vercel)

## Development

```bash
deno task dev      # hot-reload dev server at http://localhost:5173
deno task build    # production build → dist/
deno task serve    # serve dist/ locally
```

Version is controlled by the `"version"` field in `deno.json`. Running `build` or `dev` automatically syncs it into `dist/config.js` and the service worker cache name — bumping `deno.json` is the only manual step for a release.

## Block types

| Block | Description |
| --- | --- |
| Formula | Live math evaluation with units, variables, control flow |
| Summary | Formula block variant with green accent; surfaces key results |
| Plot | SVG curve plot with variable x-range and optional area fill |
| Figure | Image block with paste or click-to-upload |
| Text | Markdown text block |
| Header | Section heading |
| Section | Collapsible container (pro+ only) |
| Beam Def | Beam deflection math block |
| Sect Prop | Section properties math block |

All blocks support drag-to-reposition on a snap grid. Formula, Summary, Plot, and Figure blocks have a **stretch-right** handle at the right edge; Plot and Figure also have a **stretch-down** handle at the bottom edge.

## User roles

| Role | Access |
| --- | --- |
| `super` | Everything — all section creation, all packs, admin |
| `pro` | Create/edit section blocks + own purchased template packs |
| `demo` | Same as pro, expires 30 days from trial start |
| `free` | Use purchased section template packs only |

## Key source files

| File | Purpose |
| --- | --- |
| `src/main.ts` | Entry point — sidebar, event wiring, keyboard handling |
| `src/state.ts` | All shared mutable state |
| `src/types.ts` | Shared TypeScript interfaces and constants |
| `src/expr.ts` | Math evaluator — dimensional analysis, units, control flow |
| `src/canvas.ts` | Canvas class — DOM, snap grid, margin guide |
| `src/dnd.ts` | Drag-and-drop, block placement, selection |
| `src/auth.ts` | Supabase auth, roles, pack ownership, offline JWT cache |
| `src/persistence.ts` | Project serialize/deserialize, load/save |
| `src/blocks/formula.ts` | Formula block with live evaluation |
| `src/blocks/plot.ts` | Plot block (SVG via WASM solver) |
| `src/blocks/figure.ts` | Figure/image block |
| `src/blocks/text.ts` | Markdown text block |
| `src/blocks/pro/section.ts` | Section block — gated to pro+ |
| `src/utils/unit-defs.ts` | Unit catalog — 22 categories, English + metric, SI factors |
| `src/utils/units.ts` | Unit conversion helpers and `convert()` function |
| `src/utils/markdown.ts` | Markdown and math-expression rendering |
| `src/styles/main.css` | All application styles |
| `public/index.html` | HTML shell |
| `supabase/schema.sql` | Complete DB schema |

## Formula block unit syntax

| Syntax | Effect |
| --- | --- |
| `x = 150 [mm]` | Declares the unit of `x` — no numeric conversion, labels the result |
| `x = F [kN] [[lbf]]` | Converts the result to `lbf`; `x` is stored in `lbf` for downstream use |
| `delta(x) = expr [[in]]` | Function definition — output is converted to `in` on every call |

`[[targetUnit]]` performs real numeric conversion using the unit catalog in `src/utils/unit-defs.ts`. It handles:

- **Simple scaling**: `200 [MPa] [[ksi]]` → `29.0 ksi`
- **Compound units**: `F/A [N/mm^2] [[psi]]` → converts via shared SI base (Pa)
- **Affine temperature**: `20 [C] [[F]]` → `68 °F` (offset applied correctly)
- **Propagated units**: if `l = 12 [ft]` then `x = l^2 [[in^2]]` converts `ft²` → `in²`

The plot block automatically propagates the unit of the range bound to the sweep variable, so `delta(x)` plotted from `0` to `l [ft]` evaluates with `x` in `{ft}` — keeping polynomials like `l^3 - 2·l·x² + x³` dimensionally consistent.

Compound units (pressure, energy, power, torque, etc.) are automatically expanded into their primitive components for dimensional analysis. For example, `E = 29000 [ksi]` is tracked internally as `kip/in²` so that `E * I [in^4]` correctly cancels to `kip·in²` rather than accumulating `ksi·in⁴`. Units that expand: `psi`, `ksi`, `psf`, `ksf`, `Pa`, `kPa`, `MPa`, `GPa`, `J`, `kJ`, `MJ`, `W`, `kW`, `MW`, and the torque/velocity/acceleration/density/momentum compound ids. Note: intermediate results display the expanded form (e.g. `kip/in²` instead of `ksi`).

## Supabase setup (one-time)

1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your project URL and anon key into `public/config.js`
4. Insert a super-user row:

   ```sql
   insert into user_roles (user_id, role)
   select id, 'super' from auth.users where email = 'your@email.com';
   ```

## License codes

Year-based pro subscriptions and section pack purchases use one-time codes generated in the `license_codes` table. Format: `XXXX-XXXX-XXXX-XXXX`. Set `grants_role` (e.g. `'pro'`) and/or `grants_pack_id` plus `valid_days` (365 for annual).
