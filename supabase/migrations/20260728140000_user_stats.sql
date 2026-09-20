-- =============================================================================
-- Synapse - profile stats
--
-- The profile screen used to pull 7 rows of daily_activity and sum them on the
-- client just to show "this week". `user_stats` folds the streak row, the
-- activity roll-ups and the progress/vocabulary counts into one round-trip.
-- =============================================================================

-- Aggregate stats for the current user. Returns a single jsonb object:
--   { current_streak, longest_streak, total_xp,
--     minutes_today, minutes_week,
--     lessons_completed, words_learned, words_due }
create or replace function public.user_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'current_streak', coalesce(s.current_streak, 0),
    'longest_streak', coalesce(s.longest_streak, 0),
    'total_xp',       coalesce(s.total_xp, 0),
    'minutes_today', coalesce((
      select sum(minutes_studied) from public.daily_activity
      where user_id = auth.uid() and activity_date = current_date
    ), 0),
    'minutes_week', coalesce((
      -- Rolling 7 days, today inclusive.
      select sum(minutes_studied) from public.daily_activity
      where user_id = auth.uid() and activity_date > current_date - 7
    ), 0),
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
  -- The dummy row guarantees exactly one result even when the user has no
  -- user_streaks row yet (the left join then yields all-null streak fields).
  from (select 1) d
  left join public.user_streaks s on s.user_id = auth.uid();
$$;

revoke all on function public.user_stats() from public;
grant execute on function public.user_stats() to authenticated;
