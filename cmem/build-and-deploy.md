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

## ⚠️ Deno Deploy follows the newest RELEASE TAG, not the default branch

**Pushing `main` does not deploy anything.** Verified 2026-08-13: `main` carried 2.2.0 while the
newest tag was still `2.1.4`, and Deno Deploy kept serving 2.1.4 until the `2.2.0` tag existed.

Releases are **git tags named `X.Y.Z`**, each with a matching branch of the same name — see `1.0.1`,
`2.1.4`, `2.2.0`. There is **no `.github/workflows` and no `vercel.json`**; the pipeline is entirely
Deno Deploy's GitHub integration, configured in its dashboard rather than in the repo. (Earlier notes
here claimed "GitHub Actions → Vercel". That was inherited from the old `CLAUDE.md` and was wrong.)

A git tag is not the same as a **GitHub Release** object. If the deploy is following Releases rather
than raw tags, publishing the Release for the tag is a separate step — web UI, or `gh release create`
once `gh` is authenticated.

```bash
git tag -a 2.2.0 -m "v2.2.0 — …" <commit>
git branch 2.2.0 <commit>
git push origin refs/tags/2.2.0 refs/heads/2.2.0
```

A tag and branch sharing a name makes git warn `refname is ambiguous` — that matches the existing
convention, so disambiguate with `refs/tags/X.Y.Z` when it matters.

## ONE Deno Deploy project serves both the site and the API

Production is `https://leptonpad.jrmarcum.deno.net`. The root `main.ts` routes:

```
/api/*  →  handleApiRequest()  from api/main.ts
/*      →  serveDir over dist/
```

**Same origin on purpose.** The browser calls `/api/me`, so there is no CORS preflight, no
`ALLOWED_ORIGINS` to keep in sync with the site's URL, and one place holding the secrets.
`write-config.ts` defaults `apiBaseUrl` to the relative `"/api"`, so **production needs no
`LP_API_URL` at all** — verified by running the generator with no `.env` and no env vars present.

`api/main.ts` still runs standalone under `import.meta.main` for `deno task api:dev` on :8000, and
its routes are identical because `handleApiRequest` takes the path with any mount prefix already
stripped. `ALLOWED_ORIGINS` therefore only matters for local dev, where the site (:5173) and the API
(:8000) are genuinely cross-origin.

⚠️ **A missing API secret must not take the site down.** `api/main.ts` reports configuration problems
from `configErrors()` instead of throwing at import — throwing would kill the static server too, when
the right outcome is a working site whose API returns a clear 500. `GET /api/health` reports those
errors rather than a bare 200, because a healthy answer from a service that cannot reach its database
is a useless health check.

### Environment (Deno Deploy dashboard)

| Variable                                | Why                                                                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLERK_PUBLISHABLE_KEY`                 | Baked into `dist/config.js` at build time. **Without it Clerk never initialises and sign-in is dead** — the symptom is `clerkPublishableKey: ""` in the served config. |
| `DATABASE_URL`                          | Neon connection string, used by the mounted API.                                                                                                                       |
| `CLERK_JWT_KEY` _or_ `CLERK_SECRET_KEY` | JWT verification — PEM public key is networkless; the secret key falls back to a JWKS fetch.                                                                           |

**Deno Deploy runs the build itself.** `dist/config.js` is the one file in `dist/` that is _not_
committed, and the live site serves a generated one — so these variables are read at deploy time, and
nothing has to be committed to change them.

⚠️ Stale `SUPABASE_*` variables may still sit in the dashboard. Nothing reads them any more
(`write-config.ts` consumes only the two public values above), so they cannot cause a failure — but
delete them: if that Supabase project still exists, the key still authenticates against it.

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
6. `dist/config.js` needs no check — Deno Deploy regenerates it, and with no `.env` present it
   defaults `apiBaseUrl` to the relative `/api`.
7. Commit, then push `main`.
8. **Tag it** — `git tag -a X.Y.Z`, matching branch, push both. Without this the deploy keeps serving
   the previous release no matter what is on `main`.
9. Verify in a browser with an existing cache, not just a hard-refresh.
