-- =============================================================================
-- Synapse - table privileges
--
-- Enabling RLS and writing policies is only half of the access story: a policy
-- filters rows a role is *already* allowed to touch, it does not itself grant
-- table access. Without the grants below every query from the app failed with
-- "42501: permission denied for table ...", which RLS alone never produces
-- (a policy that matches nothing returns an empty result, not an error).
--
-- The grants mirror 20260725090200_rls_policies.sql exactly - no privilege is
-- granted that no policy would allow. `anon` gets nothing, because every policy
-- is scoped `to authenticated` and the app requires a session.
-- =============================================================================

-- Content: read-only, writes stay with the service role -----------------------
grant select on table
  public.courses,
  public.units,
  public.lessons,
  public.exercises,
  public.vocabulary_items
  to authenticated;

-- Profiles: policies cover select/insert/update, but not delete ---------------
grant select, insert, update on table public.profiles to authenticated;

-- User-owned rows: policies are `for all`, so all four verbs apply ------------
grant select, insert, update, delete on table
  public.user_lesson_progress,
  public.user_vocabulary,
  public.user_streaks,
  public.daily_activity
  to authenticated;
