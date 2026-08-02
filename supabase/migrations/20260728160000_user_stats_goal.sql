-- =============================================================================
-- Synapse - daily goal in user_stats
--
-- The home screen shows a "Today's goal" ring but had nothing to fill it with.
-- Extend user_stats with the profile's daily goal and whether today has met it,
-- so the client can render real progress instead of a hard-coded zero.
-- =============================================================================

create or replace function public.user_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with today as (
    select coalesce(sum(minutes_studied), 0)::int as minutes_today
    from public.daily_activity
    where user_id = auth.uid() and activity_date = current_date
  ),
  week as (
    -- Rolling 7 days, today inclusive.
    select coalesce(sum(minutes_studied), 0)::int as minutes_week
    from public.daily_activity
    where user_id = auth.uid() and activity_date > current_date - 7
  ),
  goal as (
    select coalesce(
      (select daily_goal_minutes from public.profiles where id = auth.uid()),
      10
    ) as daily_goal_minutes
  )
  select jsonb_build_object(
    'current_streak', coalesce(s.current_streak, 0),
    'longest_streak', coalesce(s.longest_streak, 0),
    'total_xp',       coalesce(s.total_xp, 0),
    'minutes_today',      t.minutes_today,
    'minutes_week',       w.minutes_week,
    'daily_goal_minutes', g.daily_goal_minutes,
    'goal_met_today',     (t.minutes_today >= g.daily_goal_minutes),
    'lessons_completed', (
      select count(*) from public.user_lesson_progress
      where user_id = auth.uid() and status = 'completed'
    ),
    'words_learned', (
      select count(*) from public.user_vocabulary where user_id = auth.uid()
    ),
    'words_due', (
      select count(*) from public.user_vocabulary
      where user_id = auth.uid() and due_at <= now()
    )
  )
  from goal g, today t, week w
  left join public.user_streaks s on s.user_id = auth.uid();
$$;
