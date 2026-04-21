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
|---|---|
| Formula | Live math evaluation with units, variables, control flow |
| Summary | Formula block variant with green accent; surfaces key results |
| Plot | SVG curve plot with variable x-range and optional area fill |
| Figure | Image block with paste or click-to-upload |
| Text | Markdown text block |
| Header | Section heading |
| Section | Collapsible container (pro+ only) |
| Beam Def | Beam deflection math block |
| Sect Prop | Section properties math block |

All blocks support drag-to-reposition on a snap grid. Formula, Summary, Plot, and Figure blocks have a **stretch-right** handle; Plot and Figure also have a **stretch-down** handle.

## User roles

| Role | Access |
|---|---|
| `super` | Everything — all section creation, all packs, admin |
| `pro` | Create/edit section blocks + own purchased template packs |
| `demo` | Same as pro, expires 30 days from trial start |
| `free` | Use purchased section template packs only |

## Key source files

| File | Purpose |
|---|---|
| `src/main.ts` | Entry point — sidebar, event wiring, keyboard handling |
| `src/state.ts` | All shared mutable state |
| `src/types.ts` | Shared TypeScript interfaces and constants |
| `src/canvas.ts` | Canvas class — DOM, snap grid, margin guide |
| `src/dnd.ts` | Drag-and-drop, block placement, selection |
| `src/auth.ts` | Supabase auth, roles, pack ownership, offline JWT cache |
| `src/persistence.ts` | Project serialize/deserialize, load/save |
| `src/blocks/formula.ts` | Formula block with live evaluation |
| `src/blocks/plot.ts` | Plot block (SVG via WASM solver) |
| `src/blocks/figure.ts` | Figure/image block |
| `src/blocks/text.ts` | Markdown text block |
| `src/blocks/pro/section.ts` | Section block — gated to pro+ |
| `src/styles/main.css` | All application styles |
| `public/index.html` | HTML shell |
| `supabase/schema.sql` | Complete DB schema |

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
