-- Minimal Supabase environment shim so the real migrations can run on a plain
-- Postgres for testing. NOT part of the app — test scaffolding only.

-- Roles the migrations grant to / reference.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end $$;

-- auth schema + a stand-in users table (Supabase-managed in production).
create schema if not exists auth;

create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

-- pgcrypto for gen_random_uuid in this bootstrap file (the app migration also
-- creates it, but we need it here first for the default above).
create extension if not exists pgcrypto;

-- auth.uid() reads a session GUC the tests set with set_config('app.uid', ...).
-- Production Supabase parses it from the JWT; the migrations don't care how.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.uid', true), '')::uuid;
$$;
