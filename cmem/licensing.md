# Licensing

## LeptonPad itself — proprietary

`LICENSE` at the repo root: **LeptonPad Proprietary License, Copyright (c) 2026 LeptonPad. All Rights
Reserved.** This is a commercial product with paid roles and purchasable section-template packs, not
an open-source project.

Practical consequences:

- **No copyleft dependencies.** Anything vendored or bundled must be permissive (MIT / BSD /
  Apache-2.0). A GPL or AGPL dependency in the browser bundle is not an option.
- **Attribution obligations still apply.** MIT and Apache-2.0 both require the licence text to travel
  with _distributed_ copies. `dist/` is the distribution — see the open question below.
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

⚠️ **One question remains open:** `THIRD_PARTY_NOTICES.md` is not copied into `dist/`, so decide how the
notice reaches someone who only receives the deployed site (a link in the app's about/info panel is
the usual answer for a web app).

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
