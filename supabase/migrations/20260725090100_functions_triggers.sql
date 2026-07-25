-- =============================================================================
-- Synapse - functions & triggers
-- =============================================================================

-- Keep updated_at fresh -------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger progress_touch_updated_at
  before update on public.user_lesson_progress
  for each row execute function public.touch_updated_at();

-- Create a profile + streak row for every new auth user -----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Record activity + advance the streak ----------------------------------------
create or replace function public.record_activity(
  p_minutes int default 0,
  p_xp int default 0,
  p_lessons int default 0
)
returns public.user_streaks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today   date := current_date;
  v_streak  public.user_streaks;
begin
  if v_user_id is null then
    raise exception 'record_activity must be called by an authenticated user';
  end if;

  insert into public.daily_activity (user_id, activity_date, minutes_studied, xp_earned, lessons_completed)
  values (v_user_id, v_today, greatest(p_minutes, 0), greatest(p_xp, 0), greatest(p_lessons, 0))
  on conflict (user_id, activity_date) do update
    set minutes_studied   = public.daily_activity.minutes_studied + greatest(p_minutes, 0),
        xp_earned         = public.daily_activity.xp_earned + greatest(p_xp, 0),
        lessons_completed = public.daily_activity.lessons_completed + greatest(p_lessons, 0);

  select * into v_streak from public.user_streaks where user_id = v_user_id for update;

  if v_streak.user_id is null then
    insert into public.user_streaks (user_id, current_streak, longest_streak, last_active_date, total_xp)
    values (v_user_id, 1, 1, v_today, greatest(p_xp, 0))
    returning * into v_streak;
    return v_streak;
  end if;

  if v_streak.last_active_date = v_today then
    -- already counted today, only add XP
    update public.user_streaks
      set total_xp = total_xp + greatest(p_xp, 0), updated_at = now()
      where user_id = v_user_id
      returning * into v_streak;
  elsif v_streak.last_active_date = v_today - 1 then
    update public.user_streaks
      set current_streak   = current_streak + 1,
          longest_streak   = greatest(longest_streak, current_streak + 1),
          last_active_date = v_today,
          total_xp         = total_xp + greatest(p_xp, 0),
          updated_at       = now()
      where user_id = v_user_id
      returning * into v_streak;
  else
    update public.user_streaks
      set current_streak   = 1,
          longest_streak   = greatest(longest_streak, 1),
          last_active_date = v_today,
          total_xp         = total_xp + greatest(p_xp, 0),
          updated_at       = now()
      where user_id = v_user_id
      returning * into v_streak;
  end if;

  return v_streak;
end;
$$;

-- Enroll a word into the user's review queue ---------------------------------
create or replace function public.enroll_vocabulary(p_vocabulary_id uuid)
returns public.user_vocabulary
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row     public.user_vocabulary;
begin
  if v_user_id is null then
    raise exception 'enroll_vocabulary must be called by an authenticated user';
  end if;

  insert into public.user_vocabulary (user_id, vocabulary_id)
  values (v_user_id, p_vocabulary_id)
  on conflict (user_id, vocabulary_id) do update set user_id = excluded.user_id
  returning * into v_row;

  return v_row;
end;
$$;
