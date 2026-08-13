-- =============================================================================
-- LeptonPad — Neon Postgres schema
-- Run once against your Neon database (SQL Editor, or psql "$DATABASE_URL").
--
-- Clerk owns identity, so this schema differs from a typical Postgres-with-auth
-- setup in three ways worth stating up front:
--
--   1. There is no auth.users table here. user_id is TEXT holding a Clerk user
--      id ("user_2abc..."), not a UUID with a foreign key.
--   2. The functions take p_user_id as a parameter instead of calling auth.uid().
--      THE CALLER IS TRUSTED TO PASS A VERIFIED ID. The only caller is
--      api/main.ts, which derives it from a Clerk JWT it has cryptographically
--      verified — never from the request body. Do not expose these functions to
--      any client that can choose its own p_user_id.
--   3. There are no RLS policies, because no client connects to this database.
--      The API is the security boundary. See cmem/security-model.md.
--
-- Requires: pgcrypto (for hmac + gen_random_bytes).
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- user_roles — one row per user. Absent row is treated as 'free'.
-- ---------------------------------------------------------------------------
create table if not exists user_roles (
  user_id          text primary key,
  role             text not null default 'free'
                     check (role in ('super', 'pro', 'demo', 'free')),
  trial_started_at timestamptz,
  trial_expires_at timestamptz,   -- null = no expiry (perpetual)
  created_at       timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- license_codes — one-time codes granting a role OR a pack, never both.
-- ---------------------------------------------------------------------------
create table if not exists license_codes (
  code           text primary key,   -- uppercase, e.g. 'ABCD-1234-EFGH-5678'
  grants_role    text check (grants_role in ('pro', 'demo')),
  grants_pack_id text,
  valid_days     int not null default 365,   -- 0 = perpetual
  used_by        text,
  used_at        timestamptz,
  created_at     timestamptz default now(),
  constraint one_grant check (
    (grants_role is not null)::int + (grants_pack_id is not null)::int = 1
  )
);

-- ---------------------------------------------------------------------------
-- section_packs — purchasable template packs.
-- ---------------------------------------------------------------------------
create table if not exists section_packs (
  id          text primary key,   -- short slug, e.g. 'beam-calc-v1'
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- pack_secrets — server-side secrets used to derive per-user AES keys.
-- Never leaves the database except as an HMAC digest. Never logged.
-- ---------------------------------------------------------------------------
create table if not exists pack_secrets (
  pack_id text primary key references section_packs on delete cascade,
  secret  text not null
);

-- ---------------------------------------------------------------------------
-- user_packs — which users own which packs.
-- ---------------------------------------------------------------------------
create table if not exists user_packs (
  user_id      text not null,
  pack_id      text not null references section_packs on delete cascade,
  redeemed_via text,
  purchased_at timestamptz default now(),
  expires_at   timestamptz,   -- null = perpetual ownership
  primary key (user_id, pack_id)
);

create index if not exists user_packs_user_idx on user_packs (user_id);

alter table license_codes drop constraint if exists fk_grants_pack;
alter table license_codes
  add constraint fk_grants_pack
  foreign key (grants_pack_id) references section_packs (id) on delete set null;

-- ---------------------------------------------------------------------------
-- get_my_role(p_user_id) → { role, trial_expires_at, pack_ids }
-- Applies expiry degradation server-side. A client clock is not a trust boundary.
--
-- ⚠️ Two traps, both found by the 2026-08-13 end-to-end test. Do not reintroduce:
--
--  1. NEVER early-return when there is no user_roles row. Ownership lives in
--     user_packs, which is a separate table — a `free` user who buys a pack has
--     no role row at all, and an early return made their pack INVISIBLE. Under
--     Supabase a trigger on auth.users guaranteed a row existed. Clerk has no
--     such hook, so the guarantee is gone and this function must not rely on it.
--  2. Use array[]::text[] for the empty case, not '{}'. A bare '{}' has no array
--     context here and json_build_object emits the STRING "{}" rather than [].
-- ---------------------------------------------------------------------------
create or replace function get_my_role(p_user_id text)
returns json
language plpgsql
as $$
declare
  v_row   user_roles%rowtype;
  v_role  text        := 'free';
  v_exp   timestamptz := null;
  v_packs text[];
begin
  select * into v_row from user_roles where user_id = p_user_id;

  if found then
    v_role := v_row.role;
    v_exp  := v_row.trial_expires_at;

    -- demo and pro both fall back to free once their expiry passes
    if v_role in ('demo', 'pro') and v_exp is not null and v_exp < now() then
      v_role := 'free';
    end if;
  end if;

  -- Always evaluated, role row or not.
  select array_agg(pack_id) into v_packs
  from user_packs
  where user_id = p_user_id
    and (expires_at is null or expires_at > now());

  return json_build_object(
    'role',             v_role,
    'trial_expires_at', v_exp,
    'pack_ids',         coalesce(v_packs, array[]::text[])
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- get_pack_key(p_user_id, p_pack_id) → base64 32-byte key, or null.
--
-- Key derivation is HMAC-SHA256(pack_secret, user_id). It must stay byte-for-byte
-- identical forever: change it and every template already encrypted under the old
-- key becomes permanently unreadable. See cmem/security-model.md.
-- ---------------------------------------------------------------------------
create or replace function get_pack_key(p_user_id text, p_pack_id text)
returns text
language plpgsql
as $$
declare
  v_secret   text;
  v_is_super boolean;
  v_owns     boolean;
begin
  select (role = 'super') into v_is_super from user_roles where user_id = p_user_id;

  if not coalesce(v_is_super, false) then
    select exists(
      select 1 from user_packs
      where user_id = p_user_id
        and pack_id = p_pack_id
        and (expires_at is null or expires_at > now())
    ) into v_owns;

    if not v_owns then
      return null;
    end if;
  end if;

  select secret into v_secret from pack_secrets where pack_id = p_pack_id;
  if v_secret is null then return null; end if;

  return encode(hmac(p_user_id, v_secret, 'sha256'), 'base64');
end;
$$;

-- ---------------------------------------------------------------------------
-- redeem_license_code(p_user_id, p_code) → { success, message, role?, pack_id? }
-- Consumes the code and grants exactly one of a role or a pack, atomically.
-- ---------------------------------------------------------------------------
create or replace function redeem_license_code(p_user_id text, p_code text)
returns json
language plpgsql
as $$
declare
  v_code license_codes%rowtype;
  v_exp  timestamptz;
begin
  -- Claim the code and mark it used in one statement, so two concurrent
  -- redemptions of the same code cannot both succeed.
  update license_codes
     set used_by = p_user_id, used_at = now()
   where code = upper(p_code)
     and used_by is null
  returning * into v_code;

  if not found then
    return json_build_object('success', false, 'message', 'Code not found or already used.');
  end if;

  if v_code.valid_days > 0 then
    v_exp := now() + (v_code.valid_days || ' days')::interval;
  else
    v_exp := null; -- perpetual
  end if;

  if v_code.grants_role is not null then
    insert into user_roles (user_id, role, trial_started_at, trial_expires_at)
    values (
      p_user_id,
      v_code.grants_role,
      case when v_code.grants_role = 'demo' then now() else null end,
      v_exp
    )
    on conflict (user_id) do update
      set role             = excluded.role,
          trial_started_at = excluded.trial_started_at,
          trial_expires_at = excluded.trial_expires_at;

    return json_build_object(
      'success', true,
      'message', 'Activated: ' || v_code.grants_role ||
                 case when v_exp is not null
                      then ' (expires ' || v_exp::date || ')'
                      else ' (perpetual)' end,
      'role', v_code.grants_role
    );

  elsif v_code.grants_pack_id is not null then
    insert into user_packs (user_id, pack_id, redeemed_via, expires_at)
    values (p_user_id, v_code.grants_pack_id, upper(p_code), v_exp)
    on conflict (user_id, pack_id) do update
      set expires_at = excluded.expires_at;

    return json_build_object(
      'success', true,
      'message', 'Pack unlocked: ' || v_code.grants_pack_id,
      'pack_id', v_code.grants_pack_id
    );
  end if;

  return json_build_object('success', false, 'message', 'Invalid code configuration.');
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin helpers. Run these yourself — they are not reachable from the API.
-- (No semicolons in comments here: naive statement splitters cut on them.)
-- ---------------------------------------------------------------------------

-- Create a pack and generate its secret in one step.
--   select create_section_pack('beam-calc-v1', 'Beam Templates', 'Beam deflection sections');
create or replace function create_section_pack(p_id text, p_name text, p_desc text default null)
returns text
language plpgsql
as $$
begin
  insert into section_packs (id, name, description)
  values (p_id, p_name, p_desc)
  on conflict (id) do update set name = excluded.name, description = excluded.description;

  insert into pack_secrets (pack_id, secret)
  values (p_id, encode(gen_random_bytes(32), 'hex'))
  on conflict (pack_id) do nothing;   -- never rotate silently: it would orphan sold packs

  return p_id;
end;
$$;

-- Generate a batch of license codes in XXXX-XXXX-XXXX-XXXX form.
--   select * from mint_license_codes(10, 'pro', null, 365);
create or replace function mint_license_codes(
  p_count    int,
  p_role     text default null,
  p_pack_id  text default null,
  p_days     int  default 365
)
returns setof text
language plpgsql
as $$
declare
  v_code text;
  i      int;
begin
  for i in 1..p_count loop
    -- 16 hex chars from 8 random bytes, split into four groups
    select string_agg(part, '-') into v_code
    from (
      select substring(encode(gen_random_bytes(8), 'hex') from n * 4 + 1 for 4) as part
      from generate_series(0, 3) as n
    ) parts;

    v_code := upper(v_code);

    insert into license_codes (code, grants_role, grants_pack_id, valid_days)
    values (v_code, p_role, p_pack_id, p_days);

    return next v_code;
  end loop;
end;
$$;

-- Promote the owner account. Replace with your Clerk user id (Clerk Dashboard → Users).
--   insert into user_roles (user_id, role) values ('user_xxxxxxxx', 'super')
--     on conflict (user_id) do update set role = 'super';
