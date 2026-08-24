-- =============================================================================
-- Synapse - lesson completion
--
-- Ties three things that used to be separate client round-trips into one
-- atomic, server-authoritative transaction:
--   1. mark the lesson complete (best score kept, attempts counted)
--   2. award XP + advance the streak (XP comes from lessons.xp_reward, not the
--      client, so a lesson is worth what the content says it is)
--   3. enrol the lesson's vocabulary into the SRS review queue
--
-- It also adds `lesson_vocabulary`, the missing link between the content model
-- (lessons) and the word bank (vocabulary_items).
-- =============================================================================

-- Link table: which words a lesson teaches ------------------------------------
create table public.lesson_vocabulary (
  lesson_id     uuid not null references public.lessons (id) on delete cascade,
  vocabulary_id uuid not null references public.vocabulary_items (id) on delete cascade,
  order_index   int  not null default 0,
  primary key (lesson_id, vocabulary_id)
);

create index lesson_vocabulary_lesson_idx on public.lesson_vocabulary (lesson_id, order_index);

alter table public.lesson_vocabulary enable row level security;

-- Readable by signed-in users, but only for lessons they can already see.
create policy "lesson_vocabulary: read published lesson"
  on public.lesson_vocabulary for select
  to authenticated
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_vocabulary.lesson_id and l.is_published
    )
  );

-- Complete a lesson -----------------------------------------------------------
-- Returns a jsonb summary:
--   { is_first_completion, xp_awarded, enrolled_count, streak: <user_streaks> }
create or replace function public.complete_lesson(
  p_lesson_id uuid,
  p_score     int default 0,
  p_minutes   int default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid := auth.uid();
  v_lesson   public.lessons;
  v_existing public.user_lesson_progress;
  v_first    boolean;
  v_score    int := least(greatest(coalesce(p_score, 0), 0), 100);
  v_xp       int;
  v_lessons  int;
  v_enrolled int;
  v_streak   public.user_streaks;
begin
  if v_user_id is null then
    raise exception 'complete_lesson must be called by an authenticated user';
  end if;

  -- The lesson must exist and be published; RLS does not apply inside a
  -- security-definer function, so this is the gate that replaces it.
  select * into v_lesson from public.lessons where id = p_lesson_id;
  if v_lesson.id is null then
    raise exception 'lesson % not found', p_lesson_id;
  end if;
  if not v_lesson.is_published then
    raise exception 'lesson % is not published', p_lesson_id;
  end if;

  -- Lock any existing progress row so two concurrent completions of the same
  -- lesson cannot both count as "first".
  select * into v_existing
    from public.user_lesson_progress
    where user_id = v_user_id and lesson_id = p_lesson_id
    for update;

  v_first := v_existing.id is null or v_existing.status <> 'completed';

  -- XP and the daily lesson tally are only earned the first time a lesson is
  -- finished; repeats keep the streak alive (via minutes) but cannot be farmed.
  v_xp      := case when v_first then v_lesson.xp_reward else 0 end;
  v_lessons := case when v_first then 1 else 0 end;

  insert into public.user_lesson_progress
    (user_id, lesson_id, status, score, attempts, completed_at, updated_at)
  values
    (v_user_id, p_lesson_id, 'completed', v_score, 1, now(), now())
  on conflict (user_id, lesson_id) do update
    set status       = 'completed',
        score        = greatest(coalesce(public.user_lesson_progress.score, 0), excluded.score),
        attempts     = public.user_lesson_progress.attempts + 1,
        -- Keep the original completion timestamp once it is set.
        completed_at = coalesce(public.user_lesson_progress.completed_at, excluded.completed_at),
        updated_at   = now();

  -- Enrol this lesson's words into the review queue. Idempotent: words already
  -- in the queue keep their SRS state.
  insert into public.user_vocabulary (user_id, vocabulary_id)
  select v_user_id, lv.vocabulary_id
    from public.lesson_vocabulary lv
    where lv.lesson_id = p_lesson_id
  on conflict (user_id, vocabulary_id) do nothing;
  get diagnostics v_enrolled = row_count;

  -- Reuse the streak/daily-activity logic in one place.
  select * into v_streak
    from public.record_activity(greatest(coalesce(p_minutes, 0), 0), v_xp, v_lessons);

  return jsonb_build_object(
    'is_first_completion', v_first,
    'xp_awarded',          v_xp,
    'enrolled_count',      v_enrolled,
    'streak',              to_jsonb(v_streak)
  );
end;
$$;

-- Grants ----------------------------------------------------------------------
revoke all on function public.complete_lesson(uuid, int, int) from public;
grant execute on function public.complete_lesson(uuid, int, int) to authenticated;
