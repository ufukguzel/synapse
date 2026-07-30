-- Functional tests for the RPCs. Any failed assertion raises and aborts under
-- ON_ERROR_STOP. Run via supabase/test/run.sh (not a migration).
\set ON_ERROR_STOP on

-- Fixtures from seed.sql
-- course1 = 11111111-...; lesson1 (xp 20, 3 words) / lesson2 (xp 25, 0 words)
do $$
declare
  v_user uuid;
  v_res  jsonb;
  v_row  record;
  v_cnt  int;
begin
  ---------------------------------------------------------------------------
  -- 1. New user → trigger creates profile + streak
  ---------------------------------------------------------------------------
  insert into auth.users (email, raw_user_meta_data)
  values ('learner@example.com', '{"display_name":"Ada"}'::jsonb)
  returning id into v_user;

  if not exists (select 1 from public.profiles where id = v_user) then
    raise exception 'FAIL: profile not created by trigger';
  end if;
  if (select display_name from public.profiles where id = v_user) <> 'Ada' then
    raise exception 'FAIL: display_name not taken from metadata';
  end if;
  if not exists (select 1 from public.user_streaks where user_id = v_user) then
    raise exception 'FAIL: streak row not created by trigger';
  end if;
  -- No language/timezone in this user's metadata → column defaults.
  select native_language, timezone, reminder_enabled, reminder_hour
    into v_row from public.profiles where id = v_user;
  if v_row.native_language <> 'tr' or v_row.timezone <> 'Europe/Istanbul' then
    raise exception 'FAIL: profile defaults wrong: lang=% tz=%',
      v_row.native_language, v_row.timezone;
  end if;
  -- Reminder defaults: off, 20:00.
  if v_row.reminder_enabled is not false or v_row.reminder_hour <> 20 then
    raise exception 'FAIL: reminder defaults wrong: enabled=% hour=%',
      v_row.reminder_enabled, v_row.reminder_hour;
  end if;

  -- Enabling a reminder at a valid hour persists; an out-of-range hour is rejected.
  update public.profiles set reminder_enabled = true, reminder_hour = 8 where id = v_user;
  select reminder_enabled, reminder_hour into v_row from public.profiles where id = v_user;
  if v_row.reminder_enabled is not true or v_row.reminder_hour <> 8 then
    raise exception 'FAIL: reminder update did not persist: %', v_row;
  end if;
  begin
    update public.profiles set reminder_hour = 25 where id = v_user;
    raise exception 'FAIL: reminder_hour 25 should violate the check constraint';
  exception when check_violation then
    null; -- expected
  end;

  perform set_config('app.uid', v_user::text, false);

  ---------------------------------------------------------------------------
  -- 1b. Seed is idempotent: run.sh applies it twice, so exercise counts must
  --     still be exactly what the seed declares (no duplicates).
  ---------------------------------------------------------------------------
  select count(*) into v_cnt from public.exercises
    where lesson_id = 'bbbbbbb1-0000-0000-0000-000000000001';
  if v_cnt <> 3 then
    raise exception 'FAIL: lesson 1 should have 3 exercises (seed not idempotent?), got %', v_cnt;
  end if;
  select count(*) into v_cnt from public.exercises
    where lesson_id = 'bbbbbbb1-0000-0000-0000-000000000002';
  if v_cnt <> 4 then
    raise exception 'FAIL: lesson 2 should have 4 exercises (seed not idempotent?), got %', v_cnt;
  end if;

  ---------------------------------------------------------------------------
  -- 2. lesson_states: first lesson open, second locked
  ---------------------------------------------------------------------------
  select status into v_row from public.lesson_states('11111111-1111-1111-1111-111111111111')
    where seq = 1;
  if v_row.status <> 'available' then
    raise exception 'FAIL: lesson 1 should be available, got %', v_row.status;
  end if;
  select status into v_row from public.lesson_states('11111111-1111-1111-1111-111111111111')
    where seq = 2;
  if v_row.status <> 'locked' then
    raise exception 'FAIL: lesson 2 should be locked, got %', v_row.status;
  end if;

  ---------------------------------------------------------------------------
  -- 3. complete_lesson (first time) — server XP, vocab enrolment, streak
  ---------------------------------------------------------------------------
  v_res := public.complete_lesson('bbbbbbb1-0000-0000-0000-000000000001', 90, 5);
  if (v_res->>'is_first_completion')::boolean is not true then
    raise exception 'FAIL: expected first completion';
  end if;
  if (v_res->>'xp_awarded')::int <> 20 then
    raise exception 'FAIL: xp_awarded should be 20 (lesson.xp_reward), got %', v_res->>'xp_awarded';
  end if;
  if (v_res->>'enrolled_count')::int <> 3 then
    raise exception 'FAIL: should enrol 3 words, got %', v_res->>'enrolled_count';
  end if;
  if (v_res#>>'{streak,current_streak}')::int <> 1 then
    raise exception 'FAIL: streak should be 1, got %', v_res#>>'{streak,current_streak}';
  end if;

  select * into v_row from public.user_lesson_progress
    where user_id = v_user and lesson_id = 'bbbbbbb1-0000-0000-0000-000000000001';
  if v_row.status <> 'completed' or v_row.score <> 90 or v_row.attempts <> 1 then
    raise exception 'FAIL: progress row wrong: status=% score=% attempts=%',
      v_row.status, v_row.score, v_row.attempts;
  end if;

  select count(*) into v_cnt from public.user_vocabulary where user_id = v_user;
  if v_cnt <> 3 then
    raise exception 'FAIL: expected 3 enrolled words, got %', v_cnt;
  end if;

  select * into v_row from public.daily_activity
    where user_id = v_user and activity_date = current_date;
  if v_row.minutes_studied <> 5 or v_row.xp_earned <> 20 or v_row.lessons_completed <> 1 then
    raise exception 'FAIL: daily_activity wrong: min=% xp=% lessons=%',
      v_row.minutes_studied, v_row.xp_earned, v_row.lessons_completed;
  end if;

  ---------------------------------------------------------------------------
  -- 4. lesson_states: lesson 1 completed unlocks lesson 2
  ---------------------------------------------------------------------------
  select status into v_row from public.lesson_states('11111111-1111-1111-1111-111111111111')
    where seq = 1;
  if v_row.status <> 'completed' then
    raise exception 'FAIL: lesson 1 should be completed, got %', v_row.status;
  end if;
  select status into v_row from public.lesson_states('11111111-1111-1111-1111-111111111111')
    where seq = 2;
  if v_row.status <> 'available' then
    raise exception 'FAIL: lesson 2 should now be available, got %', v_row.status;
  end if;

  ---------------------------------------------------------------------------
  -- 5. Repeat completion cannot be farmed
  ---------------------------------------------------------------------------
  v_res := public.complete_lesson('bbbbbbb1-0000-0000-0000-000000000001', 70, 3);
  if (v_res->>'is_first_completion')::boolean is not false then
    raise exception 'FAIL: repeat should not be first completion';
  end if;
  if (v_res->>'xp_awarded')::int <> 0 then
    raise exception 'FAIL: repeat xp should be 0, got %', v_res->>'xp_awarded';
  end if;

  select * into v_row from public.user_lesson_progress
    where user_id = v_user and lesson_id = 'bbbbbbb1-0000-0000-0000-000000000001';
  if v_row.score <> 90 then
    raise exception 'FAIL: best score should be kept (90), got %', v_row.score;
  end if;
  if v_row.attempts <> 2 then
    raise exception 'FAIL: attempts should be 2, got %', v_row.attempts;
  end if;

  select * into v_row from public.daily_activity
    where user_id = v_user and activity_date = current_date;
  if v_row.xp_earned <> 20 or v_row.lessons_completed <> 1 or v_row.minutes_studied <> 8 then
    raise exception 'FAIL: repeat mis-accrued: min=% xp=% lessons=%',
      v_row.minutes_studied, v_row.xp_earned, v_row.lessons_completed;
  end if;

  ---------------------------------------------------------------------------
  -- 6. user_stats aggregate
  ---------------------------------------------------------------------------
  v_res := public.user_stats();
  if (v_res->>'total_xp')::int <> 20
     or (v_res->>'minutes_week')::int <> 8
     or (v_res->>'lessons_completed')::int <> 1
     or (v_res->>'words_learned')::int <> 3
     or (v_res->>'words_due')::int <> 3 then
    raise exception 'FAIL: user_stats wrong: %', v_res;
  end if;
  -- Default goal is 10 min; 8 min studied today → not met yet.
  if (v_res->>'daily_goal_minutes')::int <> 10
     or (v_res->>'goal_met_today')::boolean is not false then
    raise exception 'FAIL: daily goal wrong (expected 10, not met): %', v_res;
  end if;

  ---------------------------------------------------------------------------
  -- 7. Completing lesson 2 (no linked vocab) adds its own xp_reward
  ---------------------------------------------------------------------------
  v_res := public.complete_lesson('bbbbbbb1-0000-0000-0000-000000000002', 100, 4);
  if (v_res->>'xp_awarded')::int <> 25 or (v_res->>'enrolled_count')::int <> 0 then
    raise exception 'FAIL: lesson 2 completion wrong: %', v_res;
  end if;
  v_res := public.user_stats();
  if (v_res->>'total_xp')::int <> 45 or (v_res->>'lessons_completed')::int <> 2 then
    raise exception 'FAIL: totals after lesson 2 wrong: %', v_res;
  end if;
  -- 12 min studied today (5 + 3 + 4) now clears the 10-min goal.
  if (v_res->>'minutes_today')::int <> 12
     or (v_res->>'goal_met_today')::boolean is not true then
    raise exception 'FAIL: daily goal should be met after lesson 2: %', v_res;
  end if;

  -- Course progress: A1 has 4 published lessons; Ada completed 2.
  select total_lessons, completed_lessons into v_row
    from public.course_progress() where course_id = '11111111-1111-1111-1111-111111111111';
  if v_row.total_lessons <> 4 or v_row.completed_lessons <> 2 then
    raise exception 'FAIL: A1 course progress wrong: %/%',
      v_row.completed_lessons, v_row.total_lessons;
  end if;

  ---------------------------------------------------------------------------
  -- 8. Favorites: starring an enrolled word surfaces it in the favorites query
  ---------------------------------------------------------------------------
  update public.user_vocabulary set is_favorite = true
    where user_id = v_user
      and vocabulary_id = (
        select id from public.vocabulary_items where headword = 'greeting' and level = 'A1'
      );
  select count(*) into v_cnt
    from public.user_vocabulary where user_id = v_user and is_favorite;
  if v_cnt <> 1 then
    raise exception 'FAIL: expected 1 favorite, got %', v_cnt;
  end if;
  -- ...and user_stats reflects it.
  v_res := public.user_stats();
  if (v_res->>'words_favorite')::int <> 1 then
    raise exception 'FAIL: user_stats words_favorite should be 1: %', v_res;
  end if;

  raise notice 'ALL HAPPY-PATH ASSERTIONS PASSED';
end $$;

-- 7b. New user WITH language/timezone metadata → those values are used
do $$
declare
  v_user uuid;
  v_row  record;
begin
  insert into auth.users (email, raw_user_meta_data)
  values (
    'polyglot@example.com',
    '{"display_name":"Kai","native_language":"en","timezone":"Europe/London"}'::jsonb
  )
  returning id into v_user;

  select native_language, timezone into v_row from public.profiles where id = v_user;
  if v_row.native_language <> 'en' or v_row.timezone <> 'Europe/London' then
    raise exception 'FAIL: metadata not applied to profile: lang=% tz=%',
      v_row.native_language, v_row.timezone;
  end if;

  raise notice 'NEW-USER METADATA ASSERTIONS PASSED';
end $$;

-- 8. Guards: unpublished / missing lesson, and unauthenticated caller
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
    perform public.complete_lesson('bbbbbbb1-0000-0000-0000-000000000001', 0, 0);
    raise exception 'FAIL: unauthenticated completion should have raised';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  raise notice 'GUARD ASSERTIONS PASSED';
end $$;

-- 9. Expanded library: the A2 course path gates across units, and completing
--    its first vocabulary lesson enrols that lesson's words.
do $$
declare
  v_user uuid;
  v_res  jsonb;
  v_cnt  int;
  v_st   text;
begin
  insert into auth.users (email) values ('library@example.com') returning id into v_user;
  perform set_config('app.uid', v_user::text, false);

  -- A2 course = 2222…; 2 units × 2 lessons = 4 in the path.
  select count(*) into v_cnt
    from public.lesson_states('22222222-2222-2222-2222-222222222222');
  if v_cnt <> 4 then
    raise exception 'FAIL: A2 course should have 4 lessons in path, got %', v_cnt;
  end if;

  select status::text into v_st
    from public.lesson_states('22222222-2222-2222-2222-222222222222') where seq = 1;
  if v_st <> 'available' then
    raise exception 'FAIL: A2 lesson 1 should be available, got %', v_st;
  end if;
  select status::text into v_st
    from public.lesson_states('22222222-2222-2222-2222-222222222222') where seq = 2;
  if v_st <> 'locked' then
    raise exception 'FAIL: A2 lesson 2 should be locked, got %', v_st;
  end if;

  -- Completing "At the market" enrols its three linked words.
  v_res := public.complete_lesson('bbbbbbb2-0000-0000-0000-000000000001', 100, 6);
  if (v_res->>'xp_awarded')::int <> 25 or (v_res->>'enrolled_count')::int <> 3 then
    raise exception 'FAIL: A2 market lesson completion wrong: %', v_res;
  end if;

  -- ...which unlocks the next lesson in the unit.
  select status::text into v_st
    from public.lesson_states('22222222-2222-2222-2222-222222222222') where seq = 2;
  if v_st <> 'available' then
    raise exception 'FAIL: A2 lesson 2 should unlock after lesson 1, got %', v_st;
  end if;

  raise notice 'EXPANDED-LIBRARY ASSERTIONS PASSED';
end $$;
