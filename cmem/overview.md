# Overview

**LeptonPad** is a browser-based **engineering calculation pad PWA**. The user drags blocks onto a
paper-sized canvas and builds a calculation sheet: formulas evaluate live with real units and
dimensional analysis, plots sweep a variable, figures and markdown text sit alongside, and section
blocks group related work under a scoped variable namespace.

The product model is a **calculation sheet an engineer can hand to a reviewer** — page-sized canvas,
title block, page numbering, print-fidelity layout. It is not a notebook or a REPL.

**Current version: 2.1.4** (`deno.json`, 2026-08-13). Proprietary — see [`licensing.md`](licensing.md).

## Repo layout

```text
LeptonPad/
├── deno.json               # Version (source of truth), import map, tasks, fmt + lint config
├── deno.lock
├── build.ts                # Production build → dist/ (bundle + minify + copy assets + gen config.js)
├── dev.ts                  # Hot-reload dev server, port 5173, SSE auto-shutdown, dev-only SW
├── serve.ts                # Serve a built dist/ locally (same SSE auto-shutdown)
├── main.ts                 # Production entrypoint for Deno Deploy — static file server over dist/
├── cmem/                   # Portable project memory (this folder)
├── api/
│   ├── main.ts             # The entitlement API — Deno Deploy. Verifies Clerk JWTs, calls Neon
│   └── deno.json           # Standalone config for the API deployment
├── db/
│   ├── schema.sql          # Neon schema — 5 tables, 3 functions, admin helpers. Run once
│   ├── check.ts            # `deno task db:check` — 10-assertion entitlement regression test
│   └── promote.ts          # `deno task promote` — grant a role by email, via Clerk lookup
├── scripts/
│   ├── sync-version.ts     # deno.json version → public/sw.js cache name
│   └── write-config.ts     # Generates dist/config.js from env / .env
├── solver/
│   └── solver.ts           # The ONLY WASM source — 3 arithmetic fns, compiled by wasmtk
├── src/
│   ├── main.ts             # Entry point — sidebar, modals, event wiring, keyboard, start()
│   ├── state.ts            # ALL shared mutable state + the callback-slot registry
│   ├── types.ts            # Shared interfaces + canvas/page constants
│   ├── expr.ts             # The math engine — lexer, parser, units, control flow (960 lines)
│   ├── canvas.ts           # Canvas class — DOM element, snap grid, margin guide, page separators
│   ├── dnd.ts              # Drag-and-drop, block placement, marquee selection, multi-drag
│   ├── backend.ts          # The provider-agnostic backend contract — the ONLY vendor seam
│   ├── backends/
│   │   └── neon-clerk.ts   # Clerk for identity, bearer-JWT fetch to the API for entitlement
│   ├── auth.ts             # Identity, roles, pack ownership, offline cache (talks to backend.ts)
│   ├── crypto.ts           # AES-256-GCM import/encrypt/decrypt for section templates
│   ├── license.ts          # License-code and section-pack redemption
│   ├── persistence.ts      # Project serialize/deserialize, save/load, encrypted block handling
│   ├── solver.ts           # 11-line WASM loader shim — aliased as `solver` in the import map
│   ├── blocks/
│   │   ├── formula.ts      # Formula + Summary blocks — live evaluation (1000 lines)
│   │   ├── plot.ts         # Plot block — SVG built as a string in TypeScript (737 lines)
│   │   ├── figure.ts       # Figure/image block — paste or click-to-upload
│   │   ├── text.ts         # Markdown text block
│   │   ├── beam-def.ts     # Beam deflection math block (calls WASM)
│   │   ├── sect-prop.ts    # Section properties math block (calls WASM)
│   │   ├── _math-block-helpers.ts
│   │   └── pro/section.ts  # Section block — collapsible container, gated to pro+
│   ├── utils/
│   │   ├── unit-defs.ts    # Unit catalog — 22 categories, SI factors, baseUnits decomposition
│   │   ├── units.ts        # convert() and friends
│   │   ├── markdown.ts     # Markdown + math-expression rendering
│   │   └── theme.ts
│   └── styles/main.css     # ALL application styles (1910 lines)
├── public/                 # Static shell — index.html, sw.js, manifest, logo, sample project
│   └── config.js           # ⚠️ shape reference only — NEVER shipped; dist/config.js is generated
├── .env.example            # Browser config template (publishable values) — committed
├── .env.api.example        # API config template (secrets) — committed, placeholders ONLY
├── LICENSE                 # Proprietary, all rights reserved
└── THIRD_PARTY_NOTICES.md  # MIT texts for Clerk, Neon, @std/*, @jrmarcum/wasmtk
```

Excluded from git (`.gitignore`): `dist/`, `.env`, `target/`, `version_history/`, and **`CLAUDE.md`**
— which is why project memory moved here.

## Key source files

| File                        | Role                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/expr.ts`               | **The heart of the product.** Tokenizer → recursive-descent `Parser` → evaluator over `Quantity = {value, unit: UnitMap}`. Owns dimensional analysis, compound-unit expansion, `[[targetUnit]]` conversion, affine temperature, user functions, and the statement/control-flow layer (`if`/`for`). Everything a formula block shows comes from here. See [`math-engine.md`](math-engine.md). |
| `src/state.ts`              | Every piece of shared mutable state: canvas dimensions, margins, the `WorkspaceState` project object, `globalScope`/`globalFnScope`, selection sets, drag state, the section maps, and the **callback slots** that break circular imports. Modules import it directly and mutate in place — no dependency injection.                                                                         |
| `src/main.ts`               | Entry point. Builds the sidebar, the login modal, the auth panel, pro-gate dialogs, keyboard handling, and `start()` — which is where every callback slot in `state.ts` gets registered, before any user event can fire.                                                                                                                                                                     |
| `src/blocks/formula.ts`     | The Formula and Summary blocks — the primary user surface. Live evaluation on input, row-by-row rendering, unit display, comparison pass/fail.                                                                                                                                                                                                                                               |
| `src/blocks/plot.ts`        | Builds an SVG **as a string** (`<svg …>` concatenation), then attaches a live crosshair group with `createElementNS`. Propagates the range-bound unit onto the sweep variable.                                                                                                                                                                                                               |
| `src/blocks/pro/section.ts` | Collapsible container. Owns section variable scoping (`sectionName` → `beam1__L`), child-block parenting, accent color, and the pro+ gate.                                                                                                                                                                                                                                                   |
| `src/utils/unit-defs.ts`    | The 22-category unit catalog with SI `factor`, optional affine `offset`, `system` (metric/english/both), and the `baseUnits` decomposition that makes compound units cancel correctly.                                                                                                                                                                                                       |
| `src/persistence.ts`        | Project JSON in and out, including the **encryption invariant** — only ciphertext is ever serialized. See [`security-model.md`](security-model.md).                                                                                                                                                                                                                                          |
| `src/backend.ts`            | The nine-method contract over identity and entitlement. **Nothing else in `src/` may import a vendor SDK** — that rule is what made the 2026-08-13 provider swap a contained change.                                                                                                                                                                                                         |
| `api/main.ts`               | The entitlement API. Verifies a Clerk JWT, then calls one of three Neon functions with the id it extracted. **The user id never comes from the request** — that single rule replaced every RLS policy.                                                                                                                                                                                       |
| `db/schema.sql`             | Five tables and three functions, each taking `p_user_id` as its first argument. No RLS, because no client connects to Postgres. Two CHECK constraints do real security work — a license code can never grant `super`.                                                                                                                                                                        |

## Mental model

- **One canvas, a flat block list, top-to-bottom evaluation.** `state.blocks` is a flat array; a
  block's membership in a section is a `parentSectionId` field, not nesting. Formula blocks evaluate
  in document order into a **shared `globalScope`**, so a variable defined in one block is visible to
  every block below it. This is the single most important behavioral fact about the app.
- **Quantities, not numbers.** Every value carries a `UnitMap` (`{kip: 1, in: -2}`). Arithmetic
  composes the maps; addition requires them to match. A dimensional mismatch is an error the user
  sees, which is the whole point of a calculation pad.
- **Compound units expand.** `29000 [ksi]` is stored as `{kip:1, in:-2}` so `E*I [in^4]` cancels to
  `kip·in²`. The visible side effect — intermediate results display the expanded form — is expected
  and correct. See [`design-decisions.md`](design-decisions.md).
- **The browser is the runtime; the backend is only the gate.** All computation, rendering, and file
  I/O happen client-side. Clerk supplies identity; the API supplies role, pack ownership, and one
  derived key. The app runs fully offline once the role and any pack keys are cached, and
  `clerk.load()` failing is caught so an offline boot still opens sheets.
- **WASM is a footnote, not the architecture.** `dist/solver.wasm` exports exactly three functions —
  `rect_area`, `rect_ix`, `solve_beam_deflection` — used only by `beam-def.ts` and `sect-prop.ts`.
  The `WASM-READY:` comments scattered through `units.ts`, `formula.ts`, and `plot.ts` mark pure
  `f64`-signature functions as _future_ promotion candidates. They are not compiled today.
- **The service worker is a deployment hazard, not a feature.** It precaches `main.js`/`main.css`,
  so a release that does not change the cache name serves stale code. See
  [`build-and-deploy.md`](build-and-deploy.md).
