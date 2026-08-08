-- Functional tests for the additive RPCs (complete_lesson, lesson_states,
-- user_stats, course_progress). Self-contained: creates its own content under
-- distinct UUIDs so it does not depend on seed.sql. Any failed assertion raises
-- and aborts under ON_ERROR_STOP. Run via supabase/test/run.sh.
\set ON_ERROR_STOP on

do $$
declare
  v_user   uuid;
  v_course uuid := 'ffffff01-0000-0000-0000-000000000001';
  v_unit   uuid := 'ffffff02-0000-0000-0000-000000000001';
  v_lsnA   uuid := 'ffffff03-0000-0000-0000-00000000000a';
  v_lsnB   uuid := 'ffffff03-0000-0000-0000-00000000000b';
  v_res    jsonb;
  v_row    record;
begin
  ---------------------------------------------------------------------------
  -- Fixtures (service role bypasses RLS)
  ---------------------------------------------------------------------------
  insert into public.courses (id, slug, title, level, order_index, is_published)
    values (v_course, 'test-course', 'Test Course', 'A1', 99, true);
  insert into public.units (id, course_id, title, order_index)
    values (v_unit, v_course, 'Test Unit', 1);
  insert into public.lessons (id, unit_id, title, kind, order_index, xp_reward, is_published)
    values (v_lsnA, v_unit, 'Lesson A', 'vocabulary', 1, 20, true),
           (v_lsnB, v_unit, 'Lesson B', 'grammar', 2, 30, true);
  insert into public.vocabulary_items (id, headword, meaning, level)
    values ('ffffff04-0000-0000-0000-000000000001', 'alpha', 'first', 'A1'),
           ('ffffff04-0000-0000-0000-000000000002', 'beta', 'second', 'A1');
  insert into public.lesson_vocabulary (lesson_id, vocabulary_id, order_index)
    values (v_lsnA, 'ffffff04-0000-0000-0000-000000000001', 1),
           (v_lsnA, 'ffffff04-0000-0000-0000-000000000002', 2);

  ---------------------------------------------------------------------------
  -- 1. New user → trigger creates profile (metadata + defaults) + streak
  ---------------------------------------------------------------------------
  insert into auth.users (email, raw_user_meta_data)
    values ('learner@example.com', '{"display_name":"Ada"}'::jsonb)
    returning id into v_user;

  select display_name, native_language, timezone into v_row
    from public.profiles where id = v_user;
  if v_row.display_name <> 'Ada' then
    raise exception 'FAIL: display_name not taken from metadata: %', v_row.display_name;
  end if;
  if v_row.native_language <> 'tr' or v_row.timezone <> 'Europe/Istanbul' then
    raise exception 'FAIL: profile defaults wrong: % / %', v_row.native_language, v_row.timezone;
  end if;
  if not exists (select 1 from public.user_streaks where user_id = v_user) then
    raise exception 'FAIL: streak row not created by trigger';
  end if;

  perform set_config('app.uid', v_user::text, false);

  ---------------------------------------------------------------------------
  -- 2. lesson_states: lesson A available, lesson B locked
  ---------------------------------------------------------------------------
  select status::text into v_row from public.lesson_states(v_course) where seq = 1;
  if v_row.status <> 'available' then
    raise exception 'FAIL: lesson A should be available, got %', v_row.status;
  end if;
  select status::text into v_row from public.lesson_states(v_course) where seq = 2;
  if v_row.status <> 'locked' then
    raise exception 'FAIL: lesson B should be locked, got %', v_row.status;
  end if;

  ---------------------------------------------------------------------------
  -- 3. complete_lesson (first time): server XP, vocab enrolment, streak
  ---------------------------------------------------------------------------
  v_res := public.complete_lesson(v_lsnA, 90, 5);
  if (v_res->>'is_first_completion')::boolean is not true then
    raise exception 'FAIL: expected first completion';
  end if;
  if (v_res->>'xp_awarded')::int <> 20 then
    raise exception 'FAIL: xp_awarded should be 20 (xp_reward), got %', v_res->>'xp_awarded';
  end if;
  if (v_res->>'enrolled_count')::int <> 2 then
    raise exception 'FAIL: should enrol 2 words, got %', v_res->>'enrolled_count';
  end if;
  if (v_res#>>'{streak,current_streak}')::int <> 1 then
    raise exception 'FAIL: streak should be 1, got %', v_res#>>'{streak,current_streak}';
  end if;

  ---------------------------------------------------------------------------
  -- 4. lesson A completed unlocks lesson B
  ---------------------------------------------------------------------------
  select status::text into v_row from public.lesson_states(v_course) where seq = 1;
  if v_row.status <> 'completed' then
    raise exception 'FAIL: lesson A should be completed, got %', v_row.status;
  end if;
  select status::text into v_row from public.lesson_states(v_course) where seq = 2;
  if v_row.status <> 'available' then
    raise exception 'FAIL: lesson B should now be available, got %', v_row.status;
  end if;

  ---------------------------------------------------------------------------
  -- 5. Repeat cannot be farmed: XP 0, best score kept, attempts counted
  ---------------------------------------------------------------------------
  v_res := public.complete_lesson(v_lsnA, 70, 3);
  if (v_res->>'is_first_completion')::boolean is not false then
    raise exception 'FAIL: repeat should not be first completion';
  end if;
  if (v_res->>'xp_awarded')::int <> 0 then
    raise exception 'FAIL: repeat xp should be 0, got %', v_res->>'xp_awarded';
  end if;
  select score, attempts into v_row from public.user_lesson_progress
    where user_id = v_user and lesson_id = v_lsnA;
  if v_row.score <> 90 or v_row.attempts <> 2 then
    raise exception 'FAIL: repeat progress wrong: score=% attempts=%', v_row.score, v_row.attempts;
  end if;

  ---------------------------------------------------------------------------
  -- 6. user_stats aggregate
  ---------------------------------------------------------------------------
  v_res := public.user_stats();
  if (v_res->>'total_xp')::int <> 20
     or (v_res->>'lessons_completed')::int <> 1
     or (v_res->>'words_learned')::int <> 2
     or (v_res->>'daily_goal_minutes')::int <> 10 then
    raise exception 'FAIL: user_stats wrong: %', v_res;
  end if;

  ---------------------------------------------------------------------------
  -- 7. Favorite surfaces in user_stats.words_favorite
  ---------------------------------------------------------------------------
  update public.user_vocabulary set is_favorite = true
    where user_id = v_user
      and vocabulary_id = 'ffffff04-0000-0000-0000-000000000001';
  v_res := public.user_stats();
  if (v_res->>'words_favorite')::int <> 1 then
    raise exception 'FAIL: words_favorite should be 1: %', v_res;
  end if;

  ---------------------------------------------------------------------------
  -- 8. course_progress: this course has 2 lessons, 1 completed
  ---------------------------------------------------------------------------
  select total_lessons, completed_lessons into v_row
    from public.course_progress() where course_id = v_course;
  if v_row.total_lessons <> 2 or v_row.completed_lessons <> 1 then
    raise exception 'FAIL: course_progress wrong: %/%', v_row.completed_lessons, v_row.total_lessons;
  end if;

  raise notice 'ALL RPC ASSERTIONS PASSED';
end $$;

-- 9. Guards: missing lesson and unauthenticated caller both raise
do $$
begin
  perform set_config('app.uid', (select id::text from auth.users limit 1), false);
  begin
    perform public.complete_lesson('00000000-0000-0000-0000-000000000000', 0, 0);
    raise exception 'FAIL: completing a missing lesson should have raised';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  perform set_config('app.uid', '', false);
  begin
    perform public.complete_lesson('ffffff03-0000-0000-0000-00000000000a', 0, 0);
    raise exception 'FAIL: unauthenticated completion should have raised';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  raise notice 'GUARD ASSERTIONS PASSED';
end $$;
