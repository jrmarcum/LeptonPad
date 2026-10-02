# Build, Dev, and Deploy

## Task graph (`deno.json`)

| Task                     | What it runs                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `deno task dev`          | `sync:version` → `build:wasm` → `dev.ts` — hot-reload server at `http://localhost:5173`    |
| `deno task build`        | `sync:version` → `build:wasm` → `build.ts` — production `dist/`                            |
| `deno task build:wasm`   | `deno run -A jsr:@jrmarcum/wasmtk modc solver/solver.ts -n dist/solver.wasm`               |
| `deno task sync:version` | `scripts/sync-version.ts` — see below                                                      |
| `deno task check`        | `deno fmt && deno lint && deno task test`                                                  |
| `deno task setup:git`    | One-time per machine — `safe.directory` + auto-maintenance off. See `known-issues.md` § 15 |
| `deno task git:tidy`     | Occasional — `prune-packed`, `repack -ad`, `fsck`. Replaces the auto-gc exFAT cannot run   |
| `deno task api:dev`      | Runs `api/main.ts` locally on :8000, reading `.env.api`                                    |
| `deno task db:check`     | 10-assertion regression test of the entitlement chain against Neon — see `testing.md`      |
| `deno task promote`      | Lists Clerk accounts + roles. `promote <email> [role]` grants one. Admin tool, local only  |
| `deno task serve`        | `serve.ts` — serve an existing `dist/` at 5173                                             |
| `deno task serve:prod`   | `main.ts` — static server for Deno Deploy                                                  |
| `deno task install`      | build + `deno install -g -n leptonpad`                                                     |
| `deno task compile`      | `deno compile` → standalone `leptonpad` binary                                             |

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

### ⚠️ `dist/` is gitignored and its contents are FORCE-ADDED, one file at a time

This is the trap that broke the 2.6.10 deploy. `.gitignore` carries `dist/`, so **a new file
`build.ts` writes there is invisible to git until someone runs `git add -f` on it specifically** —
`git add -A` will not pick it up, and nothing warns.

`dist/THIRD_PARTY_NOTICES.md` was added to `build.ts` in v2.5.3 and never committed. It worked
anyway, because Deno Deploy was running the build and regenerating it on every deploy. That hid the
gap until the build itself stopped working.

**When you add a file to `build.ts`'s copy list, `git add -f dist/<file>` in the same commit.**
Check with `git ls-files dist/` against `ls dist/`; the legitimate absentees are `config.js` (served
from the environment per request by `main.ts`, deliberately not a build artefact) and
`solver.wat` / `solver.wit` (wasm byproducts, never served).

### Deno Deploy: build command failed with exit code 143 (2026-10-02)

**143 is 128 + 15 — SIGTERM.** The build was killed, not failed: a timeout or resource limit, with
no error of its own to read. Nothing in the commit touched the server; `main.ts` and `api/main.ts`
type-checked clean and were unchanged since v2.5.3.

The real finding is that **the build on Deno Deploy was redundant.** `dist/` is committed in full
and `main.ts` only serves it — there is nothing to build at deploy time. The build was doing
`deno bundle` and a WASM compile on every push for output the repo already carried, and it had
been slowly creeping toward the limit until it crossed it.

Once `dist/THIRD_PARTY_NOTICES.md` was committed (v2.6.11), `dist/` became self-sufficient and the
build command could be removed from the Deno Deploy project settings entirely. Verified before
making the call: every committed `dist/` file was byte-identical to a fresh local build.

⚠️ **The consequence of no build step: `deno task build` must be run and `dist/` committed before
every push, or the deploy serves stale bytes.** That was already the workflow and already the
reason for the "check the deploy" trigger — confirm `deno.json` → `public/sw.js` → `dist/sw.js`
all read the same version before claiming a release shipped.

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

⚠️ **A new cache name was not enough on its own (fixed 2.2.5, 2026-09-21).** The host sends **no
`Cache-Control`** on `/main.js` or `/sw.js`, so browsers apply heuristic HTTP caching. The install
handler's plain `c.addAll(PRECACHE)` could be answered from that HTTP cache — filling the brand-new
`leptonpad-v2.2.4` cache with the **2.2.3-or-older `main.js`**. Symptom: live `main.js` verified to
contain the fix, Jon's browser still running old code. Install now uses
`addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))`. Do not revert to plain
`addAll`. Immediate workaround for a stuck browser: **Ctrl+Shift+R**, or DevTools → Application →
Clear site data.

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

`serve.ts` mirrors the SSE shutdown for a built `dist/`. Since v2.3.30 **both servers inject their
live-reload client into the response and never onto disk** — `dist/` stays exactly as
`deno task build` produced it, so a `dist/` that has been served is safe to publish. It used to be
written into `dist/index.html` permanently; see [`known-issues.md`](known-issues.md) § 6.

## Deploy

## ⚠️ Pushing `main` deploys to production (verified 2026-09-21)

**A push to `main` goes live.** Verified 2026-09-21: 2.2.3 and 2.2.4 were pushed to `main` with **no
tag**, and `https://leptonpad.com/sw.js` served `leptonpad-v2.2.4` with the new `main.js` shortly
after. Treat every push to `main` as a production release.

This reverses the 2026-08-13 observation — then, `main` carried 2.2.0 while Deno Deploy kept serving
the `2.1.4` tag until a `2.2.0` tag existed. The Deno Deploy dashboard setting has evidently changed
since; if deploys ever stop following `main`, check that setting first. A wrong "it isn't live yet"
from this stale note cost a debugging round on 2026-09-21 — **verify against the live `sw.js`, never
this file alone.**

Releases have historically also been **git tags named `X.Y.Z`**, each with a matching branch — see
`1.0.1`, `2.1.4`, `2.2.0`, `2.2.1`, `2.2.2`. Tagging is now bookkeeping, not the deploy trigger. There
is **no `.github/workflows` and no `vercel.json`**; the pipeline is entirely Deno Deploy's GitHub
integration, configured in its dashboard rather than in the repo. (Earlier notes here claimed "GitHub
Actions → Vercel". That was inherited from the old `CLAUDE.md` and was wrong.)

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

Production is `https://leptonpad.com` (also `https://leptonpad.jrmarcum.deno.net`; `www.` does not
resolve). The root `main.ts` routes:

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

## ⚠️ Changing a Deno Deploy env var ALSO needs a version bump

`/config.js` is rendered per request from the environment (`main.ts`), so a changed
`CLERK_PUBLISHABLE_KEY` reaches the **server** immediately — but `/config.js` is also in the
service worker's `PRECACHE` list, and the worker is cache-first. Until the `CACHE` name changes,
every existing browser keeps serving the config it cached under the old version, with the old key.

Paid for 2026-09-23: a Clerk **production** instance was configured and the Deploy env updated, but
`https://leptonpad.com/config.js` fetched with curl showed the new `pk_live_` key while the browser
kept using the cached `pk_test_` one. Sign-in failed against a dev Clerk instance that has a
different user directory — "I can reset my password in Clerk but cannot log into the site".

**So: after changing any env var that lands in `config.js`, bump the version and deploy.** Diagnose
this pair the same way — `curl` shows the server's truth, the browser shows the cache's.

## Release checklist

1. Test in the browser via `deno task dev`.
2. Bump `"version"` in `deno.json`. **Nothing else** — never hand-edit the version in `public/config.js`
   or the cache name in `public/sw.js`.
3. `deno task check` — fmt + lint must be clean (lint failures block, unused imports are errors).
4. `deno task build`.
5. Confirm `dist/sw.js` contains the new `leptonpad-vX.Y.Z`. **If it did not change, stop** — the
   deploy will be invisible to returning users. ⚠️ Check the build's **exit status**, not just its
   tail: on 2026-09-22 (v2.3.4) `sync-version.ts` failed with Windows os error 1224 ("user-mapped
   section open") because VS Code / the Deno LSP held `public/sw.js`, the build aborted, and a commit
   went out with a stale `dist/`. The script only writes when the cache name is out of date, so
   updating that one line in `public/sw.js` by another route (the editor, or an agent's Edit tool)
   lets the build proceed. This is the drive, not the script: `D:` is exFAT and will not let a
   memory-mapped file be replaced — see [`known-issues.md`](known-issues.md) § 15, which covers the
   same failure hitting git's own repack.
6. `dist/config.js` needs no check — Deno Deploy regenerates it, and with no `.env` present it
   defaults `apiBaseUrl` to the relative `/api`.
7. Commit, then push `main` — **this deploys to production.** A `geometric-repack`/`multi-pack-index`
   error printed after the push is the exFAT drive, not a failed push; confirm with `git log` and
   read [`known-issues.md`](known-issues.md) § 15 before chasing it.
8. Optionally tag it (`git tag -a X.Y.Z`, matching branch) to keep the release history.
9. Confirm `https://leptonpad.com/sw.js` shows the new `leptonpad-vX.Y.Z`, then verify in a browser
   with an existing cache, not just a hard-refresh.
