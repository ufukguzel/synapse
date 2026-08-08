-- =============================================================================
-- Synapse - the brain model
--
-- The design treats progress as five trainable regions of a brain rather than a
-- flat course completion count. This migration adds the tables the brain map,
-- the task list and the goal step need:
--
--   skill_regions      reference data (Reading, Writing, Listening, Speaking, Memory)
--   user_region_strength  per-user strength per region, 0..100
--   daily_tasks        the generated plan for one day
--   learning_goals     reference data (Career, Exam, Travel, Academic, Daily)
--
-- "Neural strength" is not stored: it is the sum of XP already tracked in
-- user_streaks.total_xp, so there is one source of truth for it.
-- =============================================================================

-- Regions ---------------------------------------------------------------------
create table if not exists public.skill_regions (
  code        text primary key,
  title       text        not null,
  description text        not null,
  -- Drives the region's colour on the brain map.
  accent      text        not null,
  order_index int         not null default 0
);

insert into public.skill_regions (code, title, description, accent, order_index) values
  ('listening', 'Listening', 'Understanding speech at natural pace',        '#21E6C1', 1),
  ('speaking',  'Speaking',  'Producing language out loud',                 '#7B61FF', 2),
  ('reading',   'Reading',   'Decoding written language quickly',           '#4FA8E8', 3),
  ('writing',   'Writing',   'Composing clear written language',            '#FFC15E', 4),
  ('memory',    'Memory',    'Holding vocabulary and structures in recall',  '#FF5C7A', 5)
on conflict (code) do update
  set title = excluded.title,
      description = excluded.description,
      accent = excluded.accent,
      order_index = excluded.order_index;

-- Per-user region strength ----------------------------------------------------
create table if not exists public.user_region_strength (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  region_code text        not null references public.skill_regions (code) on delete cascade,
  -- 0..100, as shown on the placement result and the brain map.
  strength    int         not null default 0 check (strength between 0 and 100),
  updated_at  timestamptz not null default now(),
  primary key (user_id, region_code)
);

create index if not exists user_region_strength_user_idx
  on public.user_region_strength (user_id);

-- Learning goals --------------------------------------------------------------
create table if not exists public.learning_goals (
  code        text primary key,
  title       text not null,
  description text not null,
  order_index int  not null default 0
);

insert into public.learning_goals (code, title, description, order_index) values
  ('career',   'Career',       'Interviews, meetings, email',   1),
  ('exam',     'Exam',         'IELTS, TOEFL, YDS',             2),
  ('travel',   'Travel',       'Get around with confidence',    3),
  ('academic', 'Academic',     'Papers, lectures, research',    4),
  ('daily',    'Daily / Media', 'Shows, news, conversation',    5)
on conflict (code) do update
  set title = excluded.title,
      description = excluded.description,
      order_index = excluded.order_index;

alter table public.profiles
  add column if not exists goal_code text references public.learning_goals (code);

-- Daily tasks -----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('pending', 'completed', 'skipped');
  end if;
end
$$;

create table if not exists public.daily_tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  task_date      date        not null default current_date,
  region_code    text        not null references public.skill_regions (code),
  title          text        not null,
  -- Optional link to the lesson that fulfils this task.
  lesson_id      uuid        references public.lessons (id) on delete set null,
  estimated_minutes int      not null default 5,
  status         public.task_status not null default 'pending',
  order_index    int         not null default 0,
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists daily_tasks_user_date_idx
  on public.daily_tasks (user_id, task_date);

-- RLS -------------------------------------------------------------------------
alter table public.skill_regions        enable row level security;
alter table public.learning_goals       enable row level security;
alter table public.user_region_strength enable row level security;
alter table public.daily_tasks          enable row level security;

drop policy if exists "regions: read all" on public.skill_regions;
create policy "regions: read all" on public.skill_regions
  for select to authenticated using (true);

drop policy if exists "goals: read all" on public.learning_goals;
create policy "goals: read all" on public.learning_goals
  for select to authenticated using (true);

drop policy if exists "region strength: own rows" on public.user_region_strength;
create policy "region strength: own rows" on public.user_region_strength
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks: own rows" on public.daily_tasks;
create policy "tasks: own rows" on public.daily_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Grants. Policies filter rows; without these every query fails with 42501.
grant select on table public.skill_regions, public.learning_goals to authenticated;
grant select, insert, update, delete on table
  public.user_region_strength,
  public.daily_tasks
  to authenticated;

-- Seed a new user's regions alongside their profile ---------------------------
create or replace function public.handle_new_user_regions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_region_strength (user_id, region_code, strength)
  select new.id, code, 0 from public.skill_regions
  on conflict (user_id, region_code) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_regions on auth.users;
create trigger on_auth_user_created_regions
  after insert on auth.users
  for each row execute function public.handle_new_user_regions();

-- Strengthen a region after a session -----------------------------------------
create or replace function public.strengthen_region(p_region_code text, p_amount int default 1)
returns public.user_region_strength
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row     public.user_region_strength;
begin
  if v_user_id is null then
    raise exception 'strengthen_region must be called by an authenticated user';
  end if;

  insert into public.user_region_strength (user_id, region_code, strength, updated_at)
  values (v_user_id, p_region_code, least(100, greatest(0, p_amount)), now())
  on conflict (user_id, region_code) do update
    set strength = least(100, greatest(0, public.user_region_strength.strength + p_amount)),
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.strengthen_region(text, int) from public;
grant execute on function public.strengthen_region(text, int) to authenticated;
