// ---------------------------------------------------------------------------
// Production entrypoint — one Deno Deploy project serves BOTH the built site
// and the entitlement API.
//
//   /api/*  → api/main.ts   (roles, pack keys, license redemption)
//   /*      → dist/         (the built browser app)
//
// Same origin on purpose. The browser calls /api/me rather than a second
// deployment, which means no CORS preflight, no ALLOWED_ORIGINS to keep in sync,
// and one place to hold the secrets. `write-config.ts` therefore defaults
// apiBaseUrl to "/api", so production needs no env var for it at all.
//
// Environment (Deno Deploy dashboard):
//   DATABASE_URL           Neon connection string
//   CLERK_JWT_KEY          PEM public key — networkless verification
//     ...or CLERK_SECRET_KEY   fallback, verifies via JWKS over the network
//   CLERK_PUBLISHABLE_KEY  baked into dist/config.js at build time
//
// A missing API secret degrades the API to a clear 500; it does NOT stop the
// site from serving. See api/main.ts → configErrors().
// ---------------------------------------------------------------------------
import { serveDir } from 'jsr:@std/http@1/file-server';
import { handleApiRequest } from './api/main.ts';

const API_PREFIX = '/api';

Deno.serve((req) => {
  const { pathname } = new URL(req.url);

  if (pathname === API_PREFIX || pathname.startsWith(API_PREFIX + '/')) {
    // Strip the mount prefix so the handler sees its own routes (/me, /health…)
    // and stays identical to the standalone `deno task api:dev` surface.
    const path = pathname.slice(API_PREFIX.length) || '/';
    return handleApiRequest(req, path);
  }

  return serveDir(req, { fsRoot: 'dist', quiet: true });
});
