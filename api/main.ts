// ---------------------------------------------------------------------------
// LeptonPad API — the entitlement boundary. Deploys to Deno Deploy.
//
// Three endpoints, mirroring the three RPCs the client has always called:
//
//   GET  /me                     → { role, trial_expires_at, pack_ids }
//   GET  /pack-key?pack_id=<id>  → { key: base64 | null }
//   POST /redeem  { code }       → { success, message, role?, pack_id? }
//
// THE SECURITY RULE, stated once: the user id comes from the verified Clerk JWT
// and from nowhere else. It is never read from a query string, body, or header.
// Every database function takes it as its first argument, so a client that could
// choose its own id would own every pack in the system. Do not add a code path
// that accepts one.
//
// Environment (set in the Deno Deploy dashboard):
//   DATABASE_URL     Neon connection string (pooled endpoint is fine)
//   CLERK_JWT_KEY    PEM public key from Clerk → API Keys. Enables networkless
//                    verification: no outbound call per request.
//   CLERK_SECRET_KEY Fallback if CLERK_JWT_KEY is unset; verification then
//                    fetches JWKS over the network.
//   ALLOWED_ORIGINS  Comma-separated exact origins allowed to call this API,
//                    e.g. "https://leptonpad.vercel.app,http://localhost:5173"
// ---------------------------------------------------------------------------

// Versions are pinned inline rather than via an import map, so this file
// deploys to Deno Deploy standalone — no config file has to travel with it.
import { neon } from 'jsr:@neon/serverless@^1';
import { verifyToken } from 'npm:@clerk/backend@^3';

const DATABASE_URL = Deno.env.get('DATABASE_URL') ?? '';
const CLERK_JWT_KEY = Deno.env.get('CLERK_JWT_KEY') ?? '';
const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY') ?? '';

const ALLOWED_ORIGINS = new Set(
  (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.');
if (!CLERK_JWT_KEY && !CLERK_SECRET_KEY) {
  throw new Error('Set CLERK_JWT_KEY (preferred) or CLERK_SECRET_KEY.');
}

// Fail loudly on the easy mistake: pasting a pk_/sk_ key into CLERK_JWT_KEY,
// which wants the PEM *public* key. Without this the service starts happily and
// then rejects every single request as unauthenticated — a silent outage that
// looks like a client bug. Verified as a real footgun on 2026-08-13.
if (CLERK_JWT_KEY && !CLERK_JWT_KEY.includes('BEGIN PUBLIC KEY')) {
  throw new Error(
    'CLERK_JWT_KEY must be the PEM public key (-----BEGIN PUBLIC KEY-----), not a ' +
      `pk_/sk_ token. Got something starting "${CLERK_JWT_KEY.slice(0, 8)}". ` +
      'Leave it empty to verify via CLERK_SECRET_KEY instead.',
  );
}

const sql = neon(DATABASE_URL);

// ---------------------------------------------------------------------------
// CORS — exact-origin allowlist. A wildcard here would let any site spend a
// signed-in user's session, so reflect only origins we published.
// ---------------------------------------------------------------------------

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function fail(message: string, status: number, origin: string | null): Response {
  return json({ error: message }, status, origin);
}

// ---------------------------------------------------------------------------
// Identity — the only place a user id enters this service.
// ---------------------------------------------------------------------------

/** Returns the Clerk user id from a verified bearer token, or null. */
async function userIdFrom(req: Request): Promise<string | null> {
  const header = req.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;

  try {
    const claims = await verifyToken(
      token,
      CLERK_JWT_KEY ? { jwtKey: CLERK_JWT_KEY } : { secretKey: CLERK_SECRET_KEY },
    );
    return typeof claims.sub === 'string' && claims.sub.length > 0 ? claims.sub : null;
  } catch {
    return null; // expired, malformed, or signed by someone else
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const { pathname, searchParams } = new URL(req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  // Unauthenticated liveness probe.
  if (pathname === '/health') {
    return json({ ok: true }, 200, origin);
  }

  const userId = await userIdFrom(req);
  if (!userId) return fail('Not signed in.', 401, origin);

  try {
    if (req.method === 'GET' && pathname === '/me') {
      const rows = await sql`select get_my_role(${userId}) as data`;
      return json(rows[0].data, 200, origin);
    }

    if (req.method === 'GET' && pathname === '/pack-key') {
      const packId = searchParams.get('pack_id');
      if (!packId) return fail('Missing pack_id.', 400, origin);

      const rows = await sql`select get_pack_key(${userId}, ${packId}) as key`;
      const key = rows[0].key as string | null;

      // 403 rather than 200-with-null so the client can distinguish "you don't
      // own this" from "the network ate the response".
      if (!key) return fail('Pack not owned.', 403, origin);
      return json({ key }, 200, origin);
    }

    if (req.method === 'POST' && pathname === '/redeem') {
      const body = await req.json().catch(() => null) as { code?: string } | null;
      const code = (body?.code ?? '').trim().toUpperCase();
      if (!code) return fail('Please enter a code.', 400, origin);

      const rows = await sql`select redeem_license_code(${userId}, ${code}) as data`;
      return json(rows[0].data, 200, origin);
    }

    return fail('Not found.', 404, origin);
  } catch (e) {
    // Never surface a database error verbatim — it can leak schema detail.
    console.error('[api]', pathname, e);
    return fail('Server error.', 500, origin);
  }
});
