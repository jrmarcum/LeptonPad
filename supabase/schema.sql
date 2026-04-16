-- =============================================================================
-- LeptonPad — Supabase schema
-- Run this once in the Supabase SQL editor for your project.
-- Requires: pgcrypto extension (enabled by default in Supabase).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- user_roles
-- One row per user. Inserted automatically on first login via trigger (see below).
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id         uuid primary key references auth.users on delete cascade,
  role            text not null default 'free'
                    check (role in ('super', 'pro', 'demo', 'free')),
  trial_started_at timestamptz,
  trial_expires_at timestamptz,   -- null = no expiry (super/pro with perpetual code)
  created_at      timestamptz default now()
);

-- RLS: users can read their own row; nobody can write directly (use RPCs)
alter table public.user_roles enable row level security;
drop policy if exists "own role read"   on public.user_roles;
drop policy if exists "own role insert" on public.user_roles;
create policy "own role read"  on public.user_roles for select using (auth.uid() = user_id);
create policy "own role insert" on public.user_roles for insert with check (auth.uid() = user_id);

-- Auto-insert a 'free' role row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- license_codes
-- One-time codes that grant a role upgrade OR unlock a section pack.
-- A code grants exactly one of: grants_role OR grants_pack_id (not both).
-- ---------------------------------------------------------------------------
create table if not exists public.license_codes (
  code            text primary key,               -- uppercase, e.g. 'ABCD-1234-EFGH-5678'
  grants_role     text check (grants_role in ('pro', 'demo')),
  grants_pack_id  text,                           -- references section_packs.id (FK added below)
  valid_days      int not null default 365,       -- 0 = perpetual
  used_by         uuid references auth.users,
  used_at         timestamptz,
  created_at      timestamptz default now(),
  constraint one_grant check (
    (grants_role is not null)::int + (grants_pack_id is not null)::int = 1
  )
);

-- Only super-user (service role / DB admin) can manage codes; users cannot read them
alter table public.license_codes enable row level security;
-- No SELECT policy → users cannot list codes. RPC uses security definer to access.

-- ---------------------------------------------------------------------------
-- section_packs
-- Purchasable template packs. pack_secrets are never exposed to clients.
-- ---------------------------------------------------------------------------
create table if not exists public.section_packs (
  id          text primary key,          -- short slug, e.g. 'beam-calc-v1'
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- Everyone can read pack metadata (name/description for the store UI)
alter table public.section_packs enable row level security;
drop policy if exists "packs public read" on public.section_packs;
create policy "packs public read" on public.section_packs for select using (true);

-- ---------------------------------------------------------------------------
-- pack_secrets
-- Server-side secrets used to derive per-user AES keys. Never accessible to clients.
-- ---------------------------------------------------------------------------
create table if not exists public.pack_secrets (
  pack_id text primary key references public.section_packs on delete cascade,
  secret  text not null    -- random 32-byte hex string, generated at pack creation time
);

-- No RLS SELECT policy → inaccessible to all clients. Only accessed via security-definer RPCs.
alter table public.pack_secrets enable row level security;

-- ---------------------------------------------------------------------------
-- user_packs
-- Which users own which section packs.
-- ---------------------------------------------------------------------------
create table if not exists public.user_packs (
  user_id      uuid references auth.users on delete cascade,
  pack_id      text references public.section_packs on delete cascade,
  redeemed_via text,                    -- the license code used
  purchased_at timestamptz default now(),
  expires_at   timestamptz,             -- null = perpetual ownership
  primary key (user_id, pack_id)
);

alter table public.user_packs enable row level security;
drop policy if exists "own packs read" on public.user_packs;
create policy "own packs read" on public.user_packs for select using (auth.uid() = user_id);

-- Add the FK from license_codes → section_packs now that section_packs exists
alter table public.license_codes drop constraint if exists fk_grants_pack;
alter table public.license_codes
  add constraint fk_grants_pack foreign key (grants_pack_id)
  references public.section_packs (id) on delete set null;

-- ---------------------------------------------------------------------------
-- RPC: redeem_license_code
-- Validates and consumes a license code for the calling user.
-- Returns: { success: boolean, message: string, role?: string, pack_id?: string }
-- ---------------------------------------------------------------------------
create or replace function public.redeem_license_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code  public.license_codes%rowtype;
  v_role  text;
  v_exp   timestamptz;
begin
  -- Normalise to uppercase
  p_code := upper(trim(p_code));

  -- Fetch unused code
  select * into v_code
  from public.license_codes
  where code = p_code and used_by is null;

  if not found then
    return json_build_object('success', false, 'message', 'Code not found or already used.');
  end if;

  -- Mark as used
  update public.license_codes
  set used_by = auth.uid(), used_at = now()
  where code = p_code;

  -- Calculate expiry
  if v_code.valid_days > 0 then
    v_exp := now() + (v_code.valid_days || ' days')::interval;
  else
    v_exp := null; -- perpetual
  end if;

  -- Apply grant
  if v_code.grants_role is not null then
    insert into public.user_roles (user_id, role, trial_started_at, trial_expires_at)
    values (
      auth.uid(),
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
      'message', 'Activated: ' || v_code.grants_role || case when v_exp is not null then ' (expires ' || v_exp::date || ')' else ' (perpetual)' end,
      'role', v_code.grants_role
    );

  elsif v_code.grants_pack_id is not null then
    insert into public.user_packs (user_id, pack_id, redeemed_via, expires_at)
    values (auth.uid(), v_code.grants_pack_id, p_code, v_exp)
    on conflict (user_id, pack_id) do update
      set expires_at = excluded.expires_at,
          redeemed_via = excluded.redeemed_via;

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
-- RPC: get_pack_key
-- Returns a base64-encoded 32-byte AES key derived from the pack secret + caller uid.
-- Returns null if the caller does not own the pack.
-- ---------------------------------------------------------------------------
create or replace function public.get_pack_key(p_pack_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret  text;
  v_is_super boolean;
  v_owns    boolean;
begin
  -- Super users get access to all packs
  select (role = 'super') into v_is_super
  from public.user_roles where user_id = auth.uid();

  if not coalesce(v_is_super, false) then
    -- Check pack ownership and expiry
    select exists(
      select 1 from public.user_packs
      where user_id = auth.uid()
        and pack_id  = p_pack_id
        and (expires_at is null or expires_at > now())
    ) into v_owns;

    if not v_owns then
      return null;
    end if;
  end if;

  -- Fetch pack secret (inaccessible to clients via RLS)
  select secret into v_secret from public.pack_secrets where pack_id = p_pack_id;
  if v_secret is null then return null; end if;

  -- Derive a 32-byte key: HMAC-SHA256(secret, user_id_string)
  -- Returns base64 of the 32-byte digest
  return encode(
    hmac(auth.uid()::text, v_secret, 'sha256'),
    'base64'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: get_my_role
-- Returns the caller's current effective role and trial expiry.
-- Used by the client on login to hydrate auth state.
-- ---------------------------------------------------------------------------
create or replace function public.get_my_role()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.user_roles%rowtype;
  v_packs text[];
begin
  select * into v_row from public.user_roles where user_id = auth.uid();

  if not found then
    return json_build_object('role', 'free', 'pack_ids', '{}');
  end if;

  -- For demo: degrade to free if trial expired
  if v_row.role = 'demo' and v_row.trial_expires_at is not null and v_row.trial_expires_at < now() then
    v_row.role := 'free';
  end if;

  -- Also degrade pro if it has an expiry that has passed
  if v_row.role = 'pro' and v_row.trial_expires_at is not null and v_row.trial_expires_at < now() then
    v_row.role := 'free';
  end if;

  select array_agg(pack_id) into v_packs
  from public.user_packs
  where user_id = auth.uid()
    and (expires_at is null or expires_at > now());

  return json_build_object(
    'role',            v_row.role,
    'trial_expires_at', v_row.trial_expires_at,
    'pack_ids',        coalesce(v_packs, '{}')
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Helper: create a new section pack (run as super-user / service role)
-- Usage: select create_section_pack('beam-calc-v1', 'Beam Calculation Templates', 'Pre-built beam deflection sections');
-- ---------------------------------------------------------------------------
create or replace function public.create_section_pack(p_id text, p_name text, p_desc text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.section_packs (id, name, description) values (p_id, p_name, p_desc)
  on conflict (id) do nothing;

  insert into public.pack_secrets (pack_id, secret)
  values (p_id, encode(gen_random_bytes(32), 'hex'))
  on conflict (pack_id) do nothing;
end;
$$;
