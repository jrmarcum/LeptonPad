# Licensing

## LeptonPad itself — proprietary

`LICENSE` at the repo root: **LeptonPad Proprietary License, Copyright (c) 2026 LeptonPad. All Rights
Reserved.** This is a commercial product with paid roles and purchasable section-template packs, not
an open-source project.

💰 **What the tiers cost and what each one grants is in [`pricing.md`](pricing.md).** ⚠️ One item
there lands on this file rather than on code: **Pro grants commercial use, Free and Student do
not** — a change to `LICENSE`, to be made before the first sale.

Practical consequences:

- **No copyleft dependencies.** Anything vendored or bundled must be permissive (MIT / BSD /
  Apache-2.0). A GPL or AGPL dependency in the browser bundle is not an option.
- **Attribution obligations still apply.** MIT and Apache-2.0 both require the licence text to travel
  with _distributed_ copies, and **`dist/` is the distribution** — the deployed site is a distributed
  copy, so a notices file that exists only in the repo does not discharge the obligation. Shipped
  since 2026-10-02; see the delivery table below.
- **The source is not public**, so a "compliant repository" claim is worth less here than in an open
  project. What matters is what ships to a browser.

## Third-party components

`THIRD_PARTY_NOTICES.md` is the **compliance source of truth**. It reproduces full licence text for:

| Component                                                                                                                                                             | Licence                           | Where it lands                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Clerk browser SDK** (`@clerk/clerk-js`, headless build)                                                                                                             | MIT, © 2022 Clerk, Inc.           | **Bundled into `dist/main.js` — the only component that reaches end users.**                                  |
| **Clerk backend SDK** (`@clerk/backend`)                                                                                                                              | MIT, © 2022 Clerk, Inc.           | The API on Deno Deploy. Not sent to browsers.                                                                 |
| **Neon serverless driver** (`@neon/serverless`)                                                                                                                       | MIT, © 2022–2025 Neon Inc.        | The API on Deno Deploy. Not sent to browsers.                                                                 |
| **Deno Standard Library** (`@std/cli`, `@std/encoding`, `@std/fmt`, `@std/fs`, `@std/html`, `@std/http`, `@std/media-types`, `@std/net`, `@std/path`, `@std/streams`) | MIT, © 2018–2026 the Deno authors | Server-side only — `@std/http/file-server` in `dev.ts`, `serve.ts`, `main.ts`. **Not in the browser bundle.** |
| **wasmtk** (`@jrmarcum/wasmtk`)                                                                                                                                       | MIT, © 2026 jrmarcum              | Build-time only — `deno task build:wasm` compiles `solver/solver.ts` → `dist/solver.wasm`. Not shipped.       |

✅ **The bundled-and-unlisted gap is closed (2026-08-13).** It was `@supabase/supabase-js` — the one
component that actually shipped to browsers and the one missing from the ledger. Supabase is gone,
and its replacement `@clerk/clerk-js` **is** listed, along with `@clerk/backend` and
`@neon/serverless` for the API. All MIT, all verified from the packages themselves rather than
assumed.

✅ **The delivery question is closed too (2026-10-02, v2.5.3).** `THIRD_PARTY_NOTICES.md` now
actually reaches the people the licence is about:

| Step                                | Where                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Copied into the distribution        | `build.ts` → `dist/THIRD_PARTY_NOTICES.md`                                                     |
| Reachable offline                   | `public/sw.js` `PRECACHE`                                                                      |
| Visible to a user                   | Sidebar link "Third-party notices", beside the licence line (`renderSidebar` in `src/main.ts`) |
| Served so a browser **displays** it | `main.ts` forces `text/plain` for that one path                                                |

Two details worth keeping:

- **The link is relative (`/THIRD_PARTY_NOTICES.md`), not a GitHub URL.** The obligation is that the
  notice travels with the distributed copy; a link off to a repository someone may not be able to
  reach does not discharge it, and would break for an offline PWA install.
- **`serveDir` infers `text/markdown`, and browsers download that.** Left alone, clicking the link
  would have dropped a file into Downloads — compliant, since the file ships regardless, but not a
  notice anyone would read. One explicit route in `main.ts` sets `text/plain`.

⚠️ **When adding any dependency that reaches the browser bundle, add it to the ledger in the same
commit.** That is the gap that bit once already (`@supabase/supabase-js`, closed 2026-08-13) and the
shipping path above does nothing to catch a component that was never listed.

**A compliant repository is not a compliant distribution.** Whoever loads the deployed page never sees
the repo. If a licence obligation attaches to bundled code, the notice has to be reachable from the
running app, not just from `git`.

## Rules

1. **Before adding any dependency**, check the licence. Permissive only. Record it in
   `THIRD_PARTY_NOTICES.md` at the same time as the `deno.json` change — not "later."
2. **Distinguish build-time from runtime.** A build tool that never ships (wasmtk) and a server module
   that never reaches the browser (`@std/http`) carry lighter obligations than anything inside
   `dist/main.js`. Note which bucket each component is in.
3. **`THIRD_PARTY_NOTICES.md` is the ledger; this file is the strategy.** Keep them consistent — when
   one changes, check the other.
4. The section-template packs users purchase are **LeptonPad content**, protected by encryption and
   licence code, not by copyright registration. See [`security-model.md`](security-model.md).
