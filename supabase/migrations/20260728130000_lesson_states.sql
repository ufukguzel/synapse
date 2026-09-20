-- =============================================================================
-- Synapse - lesson progression
--
-- `progress_status` has always had `locked` / `available` values, but nothing
-- computed them: every lesson was freely playable. `lesson_states` turns the
-- linear course path into real gating — a lesson unlocks only once the one
-- before it is completed.
-- =============================================================================

-- Per-lesson state for the current user, across a whole course. Lessons are
-- sequenced by unit order then lesson order, so the path spans units.
--
--   locked      previous lesson not yet completed
--   available   unlocked, not started
--   in_progress unlocked, has a progress row but not completed
--   completed   finished at least once
create or replace function public.lesson_states(p_course_id uuid)
returns table (
  lesson_id    uuid,
  unit_id      uuid,
  seq          int,
  status       public.progress_status,
  score        int,
  is_available boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with ordered as (
    select l.id as lesson_id, l.unit_id,
           row_number() over (order by u.order_index, l.order_index) as seq
    from public.lessons l
    join public.units u on u.id = l.unit_id
    where u.course_id = p_course_id and l.is_published
  ),
  progressed as (
    select o.lesson_id, o.unit_id, o.seq,
           p.status as user_status,
           p.score  as user_score,
           coalesce(p.status = 'completed', false) as completed
    from ordered o
    left join public.user_lesson_progress p
      on p.lesson_id = o.lesson_id and p.user_id = auth.uid()
  ),
  gated as (
    select *,
           -- The first lesson is always open; every other opens when the one
           -- immediately before it (in the course sequence) is completed.
           case when seq = 1 then true
                else coalesce(lag(completed) over (order by seq), false)
           end as prev_done
    from progressed
  )
  select
    lesson_id,
    unit_id,
    seq,
    case
      when completed              then 'completed'::public.progress_status
      when prev_done and user_status is not null then 'in_progress'::public.progress_status
      when prev_done              then 'available'::public.progress_status
      else 'locked'::public.progress_status
    end as status,
    user_score as score,
    (completed or prev_done) as is_available
  from gated
  order by seq;
$$;

revoke all on function public.lesson_states(uuid) from public;
grant execute on function public.lesson_states(uuid) to authenticated;
