-- =============================================================================
-- Synapse - Row Level Security
--
-- Content tables (courses/units/lessons/exercises/vocabulary_items) are
-- world-readable when published; only the service role may write them.
-- User tables are strictly scoped to auth.uid().
-- =============================================================================

alter table public.profiles             enable row level security;
alter table public.courses              enable row level security;
alter table public.units                enable row level security;
alter table public.lessons              enable row level security;
alter table public.exercises            enable row level security;
alter table public.vocabulary_items     enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.user_vocabulary      enable row level security;
alter table public.user_streaks         enable row level security;
alter table public.daily_activity       enable row level security;

-- Profiles --------------------------------------------------------------------
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Content (read-only for signed-in users) -------------------------------------
create policy "courses: read published"
  on public.courses for select
  to authenticated
  using (is_published);

create policy "units: read published course"
  on public.units for select
  to authenticated
  using (exists (select 1 from public.courses c where c.id = units.course_id and c.is_published));

create policy "lessons: read published"
  on public.lessons for select
  to authenticated
  using (is_published);

create policy "exercises: read published lesson"
  on public.exercises for select
  to authenticated
  using (exists (select 1 from public.lessons l where l.id = exercises.lesson_id and l.is_published));

create policy "vocabulary: read all"
  on public.vocabulary_items for select
  to authenticated
  using (true);

-- User progress ---------------------------------------------------------------
create policy "progress: own rows"
  on public.user_lesson_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_vocabulary: own rows"
  on public.user_vocabulary for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "streaks: own row"
  on public.user_streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_activity: own rows"
  on public.daily_activity for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Function grants -------------------------------------------------------------
revoke all on function public.record_activity(int, int, int) from public;
revoke all on function public.enroll_vocabulary(uuid) from public;
grant execute on function public.record_activity(int, int, int) to authenticated;
grant execute on function public.enroll_vocabulary(uuid) to authenticated;
