-- =============================================================================
-- Synapse - course progress
--
-- Per-course completion for the current user, so any surface can show "3 / 8"
-- or a percentage without fanning out a query per unit/lesson.
-- =============================================================================

create or replace function public.course_progress()
returns table (
  course_id        uuid,
  total_lessons    int,
  completed_lessons int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    count(l.*)::int as total_lessons,
    count(l.*) filter (where p.status = 'completed')::int as completed_lessons
  from public.courses c
  join public.units u on u.course_id = c.id
  join public.lessons l on l.unit_id = u.id and l.is_published
  left join public.user_lesson_progress p
    on p.lesson_id = l.id and p.user_id = auth.uid()
  where c.is_published
  group by c.id;
$$;

revoke all on function public.course_progress() from public;
grant execute on function public.course_progress() to authenticated;
