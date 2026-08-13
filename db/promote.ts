// ---------------------------------------------------------------------------
// promote.ts — grant a role to a user, by email.
//
//   deno task promote                          list the Clerk accounts
//   deno task promote you@example.com          make that account 'super'
//   deno task promote you@example.com pro      make it 'pro' instead
//
// Looks the account up in Clerk (so you never have to copy a user id by hand),
// then upserts user_roles in Neon. Reads .env.api — the same secrets the API
// uses. Admin tool: run it locally, never expose it over HTTP.
// ---------------------------------------------------------------------------

import { neon } from 'jsr:@neon/serverless@^1';
import { createClerkClient } from 'npm:@clerk/backend@^3';

const ROLES = ['super', 'pro', 'demo', 'free'] as const;
type Role = typeof ROLES[number];

const SECRET = Deno.env.get('CLERK_SECRET_KEY') ?? '';
const DB = Deno.env.get('DATABASE_URL') ?? '';

if (!SECRET) {
  console.error('CLERK_SECRET_KEY is not set in .env.api — needed to look up the account.');
  Deno.exit(1);
}
if (!DB) {
  console.error('DATABASE_URL is not set in .env.api.');
  Deno.exit(1);
}

const clerk = createClerkClient({ secretKey: SECRET });
const sql = neon(DB);

/** Clerk's list response has been both a bare array and { data } across versions. */
// deno-lint-ignore no-explicit-any
function rows(res: any): any[] {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

// deno-lint-ignore no-explicit-any
function emailOf(u: any): string {
  const primary = u.emailAddresses?.find((e: { id: string }) => e.id === u.primaryEmailAddressId);
  return primary?.emailAddress ?? u.emailAddresses?.[0]?.emailAddress ?? '(no email)';
}

const [emailArg, roleArg] = Deno.args;
const role = (roleArg ?? 'super') as Role;

if (!ROLES.includes(role)) {
  console.error(`Unknown role "${role}". Use one of: ${ROLES.join(', ')}`);
  Deno.exit(1);
}

// ---------------------------------------------------------------------------
// No email given — list the accounts so you can see what exists.
// ---------------------------------------------------------------------------
if (!emailArg) {
  const users = rows(await clerk.users.getUserList({ limit: 50 }));

  if (users.length === 0) {
    console.log('No Clerk accounts yet.');
    console.log('Sign up through the app first, then re-run with your email.');
    Deno.exit(0);
  }

  const current = await sql`select user_id, role from user_roles`;
  const roleFor = new Map(current.map((r) => [r.user_id as string, r.role as string]));

  console.log(`${users.length} Clerk account(s):\n`);
  for (const u of users) {
    console.log(
      `  ${emailOf(u).padEnd(34)} ${u.id.padEnd(34)} ${roleFor.get(u.id) ?? 'free (no row)'}`,
    );
  }
  console.log('\nPromote with:  deno task promote <email> [role]');
  Deno.exit(0);
}

// ---------------------------------------------------------------------------
// Promote the named account.
// ---------------------------------------------------------------------------
const matches = rows(await clerk.users.getUserList({ emailAddress: [emailArg] }));

if (matches.length === 0) {
  console.error(`No Clerk account for "${emailArg}".`);
  console.error('Sign up through the app first. Run with no arguments to list existing accounts.');
  Deno.exit(1);
}
if (matches.length > 1) {
  console.error(`"${emailArg}" matched ${matches.length} accounts — resolve this in Clerk first.`);
  Deno.exit(1);
}

const user = matches[0];

await sql`
  insert into user_roles (user_id, role)
  values (${user.id}, ${role})
  on conflict (user_id) do update set role = excluded.role
`;

const check = await sql`select role from user_roles where user_id = ${user.id}`;
console.log(`${emailOf(user)} (${user.id}) → role is now "${check[0]?.role}"`);
