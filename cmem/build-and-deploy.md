# Build, Dev, and Deploy

## Task graph (`deno.json`)

| Task                     | What it runs                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `deno task dev`          | `sync:version` → `build:wasm` → `dev.ts` — hot-reload server at `http://localhost:5173`   |
| `deno task build`        | `sync:version` → `build:wasm` → `build.ts` — production `dist/`                           |
| `deno task build:wasm`   | `deno run -A jsr:@jrmarcum/wasmtk modc solver/solver.ts -n dist/solver.wasm`              |
| `deno task sync:version` | `scripts/sync-version.ts` — see below                                                     |
| `deno task check`        | `deno fmt && deno lint`                                                                   |
| `deno task api:dev`      | Runs `api/main.ts` locally on :8000, reading `.env.api`                                   |
| `deno task db:check`     | 10-assertion regression test of the entitlement chain against Neon — see `testing.md`     |
| `deno task promote`      | Lists Clerk accounts + roles. `promote <email> [role]` grants one. Admin tool, local only |
| `deno task serve`        | `serve.ts` — serve an existing `dist/` at 5173                                            |
| `deno task serve:prod`   | `main.ts` — static server for Deno Deploy                                                 |
| `deno task install`      | build + `deno install -g -n leptonpad`                                                    |
| `deno task compile`      | `deno compile` → standalone `leptonpad` binary                                            |

Formatting is enforced: 2-space indent, **single quotes**, semicolons, `lineWidth: 100`,
`proseWrap: preserve`, `dist/` excluded. Lint uses the `recommended` tag set. **Deno treats unused
imports as errors, not warnings** — see [`conventions.md`](conventions.md).

## The version chain — the only release mechanism

`deno.json` `"version"` is the **single source of truth**. `scripts/sync-version.ts` runs on every
`build` and `dev` and patches **one** file: `public/sw.js`, the cache name
`const CACHE = 'leptonpad-v<version>'`. `build.ts` copies that file verbatim, so the patch is live.

Then `build.ts`:

- runs `deno bundle --platform browser --minify --outdir dist src/main.ts` → `dist/main.js`;
- copies `src/styles/main.css` → `dist/main.css`, plus `public/`'s `manifest.webmanifest`, **`sw.js`**,
  `index.html`, `LeptonPadLogo.png`, `sample_project.json`;
- calls `scripts/write-config.ts` to **generate `dist/config.js`** from `CLERK_PUBLISHABLE_KEY` and
  `LP_API_URL` (process env first, then `.env`, then placeholders), with the version read straight
  from `deno.json`.

⚠️ **`public/config.js` is never copied to `dist/`.** It is a shape reference only — both `build.ts`
and `dev.ts` write `dist/config.js` from scratch via the one shared generator. `sync-version.ts` used
to patch `public/config.js` too; that was dead work and was removed on 2026-08-13.

## Service-worker cache busting — read this before debugging "it didn't fix it"

`public/sw.js` precaches `/`, `/main.js`, `/main.css`, `/solver.wasm`, `/config.js`, the manifest, and
the logo, and serves **cache-first**. `activate` deletes every cache whose name is not the current
`CACHE`. Therefore:

> **A deploy that does not change the `leptonpad-vX.Y.Z` cache name will serve the old JS from the
> browser cache, forever, to every returning user.**

Which makes the bump in `deno.json` not a formality but _the_ release action. When Jon reports a fix
did not take, **check the cache name in the deployed `sw.js` first** — that has been the answer
before.

**Never remove `Cache-Control: no-store` from `dev.ts`.** Without it the browser caches stale CSS/JS
across dev restarts and you spend an hour debugging code that is not running.

## Dev server (`dev.ts`) — what it does beyond serving files

- Writes a **throwaway dev service worker** that deletes all caches on activate, claims clients,
  force-navigates open tabs, and is pure network-only. It deliberately never uses `public/sw.js`.
- Injects `<script>new EventSource('/__dev_sse')</script>` into `dist/index.html` — **dev-only, not in
  the source HTML**.
- **SSE close-detection with a 5-second grace period**: when the browser tab closes, the SSE aborts and
  a timer shuts the server (and the bundler child process) down. A page _refresh_ reconnects and
  cancels the timer. This is why closing the tab stops `deno task dev`.
- `Deno.watchFs('src/styles/main.css')` hot-copies CSS to `dist/` without a rebundle.
- Runs `deno bundle … --watch` as a child process for TS.
- Opens the browser with `new Deno.Command('cmd', {args: ['/c','start', …]})` — **Windows-only**. On
  another OS the server still works; only auto-open fails.

`serve.ts` mirrors the SSE shutdown for a built `dist/`, but note it **writes the SSE snippet into
`dist/index.html` permanently** (guarded by an `includes('/__sse')` check). Do not serve a `dist/` you
are about to publish through `serve.ts` without rebuilding.

## Deploy

**Two deployables**, and they are separate:

| What                      | Where              | Env it reads                                                                                     |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| The browser app (`dist/`) | **Vercel**, static | `CLERK_PUBLISHABLE_KEY`, `LP_API_URL` — public values, baked into `dist/config.js` at build time |
| The API (`api/main.ts`)   | **Deno Deploy**    | `DATABASE_URL`, `CLERK_JWT_KEY` or `CLERK_SECRET_KEY`, `ALLOWED_ORIGINS` — **secrets**           |

`main.ts` at the repo root exists for the Deno Deploy static path (`serveDir` over `dist/`) and is
unrelated to `api/main.ts`.

Locally the same two sets come from `.env` and `.env.api`, both gitignored, with
`.env.example` / `.env.api.example` as committed templates holding **placeholders only**. The full
map of which value lives where is in [`backend-migration.md`](backend-migration.md).

⚠️ **`ALLOWED_ORIGINS` must list the browser app's exact origin**, including `http://localhost:5173`
for development. It is an exact-match allowlist with no wildcards — miss it and every API call fails
CORS with no useful error in the app.

## Release checklist

1. Test in the browser via `deno task dev`.
2. Bump `"version"` in `deno.json`. **Nothing else** — never hand-edit the version in `public/config.js`
   or the cache name in `public/sw.js`.
3. `deno task check` — fmt + lint must be clean (lint failures block, unused imports are errors).
4. `deno task build`.
5. Confirm `dist/sw.js` contains the new `leptonpad-vX.Y.Z`. **If it did not change, stop** — the
   deploy will be invisible to returning users.
6. Deploy. Verify in a browser with an existing cache, not just a hard-refresh.
