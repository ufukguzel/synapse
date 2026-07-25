-- =============================================================================
-- Synapse - initial schema
-- =============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------------
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
create type lesson_kind as enum ('vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing');
create type exercise_kind as enum (
  'multiple_choice', 'fill_blank', 'match_pairs', 'word_order',
  'listen_type', 'speak_repeat', 'translate'
);
create type progress_status as enum ('locked', 'available', 'in_progress', 'completed');

-- Profiles --------------------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  username             text unique,
  display_name         text,
  avatar_url           text,
  native_language      text        not null default 'tr',
  target_level         cefr_level  not null default 'B1',
  current_level        cefr_level  not null default 'A1',
  daily_goal_minutes   int         not null default 10 check (daily_goal_minutes between 1 and 240),
  timezone             text        not null default 'Europe/Istanbul',
  onboarding_completed boolean     not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Content ---------------------------------------------------------------------
create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text        not null,
  description  text,
  level        cefr_level  not null,
  cover_url    text,
  order_index  int         not null default 0,
  is_published boolean     not null default false,
  created_at   timestamptz not null default now()
);

create table public.units (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid        not null references public.courses (id) on delete cascade,
  title       text        not null,
  description text,
  order_index int         not null default 0,
  icon        text,
  created_at  timestamptz not null default now()
);

create table public.lessons (
  id                uuid primary key default gen_random_uuid(),
  unit_id           uuid        not null references public.units (id) on delete cascade,
  title             text        not null,
  kind              lesson_kind not null default 'vocabulary',
  order_index       int         not null default 0,
  xp_reward         int         not null default 20 check (xp_reward >= 0),
  estimated_minutes int         not null default 5 check (estimated_minutes > 0),
  is_published      boolean     not null default false,
  created_at        timestamptz not null default now()
);

create table public.exercises (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid          not null references public.lessons (id) on delete cascade,
  kind        exercise_kind not null,
  prompt      text          not null,
  payload     jsonb         not null default '{}'::jsonb,
  audio_url   text,
  image_url   text,
  order_index int           not null default 0,
  created_at  timestamptz   not null default now()
);

create table public.vocabulary_items (
  id               uuid primary key default gen_random_uuid(),
  headword         text        not null,
  phonetic         text,
  meaning          text        not null,
  translation      text,
  example_sentence text,
  audio_url        text,
  image_url        text,
  level            cefr_level  not null default 'A1',
  tags             text[]      not null default '{}',
  created_at       timestamptz not null default now(),
  unique (headword, level)
);

-- User progress ---------------------------------------------------------------
create table public.user_lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid            not null references auth.users (id) on delete cascade,
  lesson_id    uuid            not null references public.lessons (id) on delete cascade,
  status       progress_status not null default 'in_progress',
  score        int             check (score between 0 and 100),
  attempts     int             not null default 1,
  completed_at timestamptz,
  updated_at   timestamptz     not null default now(),
  unique (user_id, lesson_id)
);

create table public.user_vocabulary (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid           not null references auth.users (id) on delete cascade,
  vocabulary_id    uuid           not null references public.vocabulary_items (id) on delete cascade,
  ease_factor      numeric(4, 3)  not null default 2.500 check (ease_factor >= 1.3),
  interval_days    int            not null default 0 check (interval_days >= 0),
  repetitions      int            not null default 0 check (repetitions >= 0),
  due_at           timestamptz    not null default now(),
  last_reviewed_at timestamptz,
  is_favorite      boolean        not null default false,
  unique (user_id, vocabulary_id)
);

create table public.user_streaks (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  current_streak   int         not null default 0,
  longest_streak   int         not null default 0,
  last_active_date date,
  total_xp         int         not null default 0,
  updated_at       timestamptz not null default now()
);

create table public.daily_activity (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users (id) on delete cascade,
  activity_date     date        not null default current_date,
  minutes_studied   int         not null default 0,
  xp_earned         int         not null default 0,
  lessons_completed int         not null default 0,
  unique (user_id, activity_date)
);

-- Indexes ---------------------------------------------------------------------
create index units_course_idx           on public.units (course_id, order_index);
create index lessons_unit_idx           on public.lessons (unit_id, order_index);
create index exercises_lesson_idx       on public.exercises (lesson_id, order_index);
create index courses_level_idx          on public.courses (level) where is_published;
create index progress_user_idx          on public.user_lesson_progress (user_id);
create index user_vocab_due_idx         on public.user_vocabulary (user_id, due_at);
create index daily_activity_user_idx    on public.daily_activity (user_id, activity_date desc);
create index vocabulary_level_idx       on public.vocabulary_items (level);
