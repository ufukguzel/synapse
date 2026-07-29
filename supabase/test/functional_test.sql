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
  select native_language, timezone into v_row from public.profiles where id = v_user;
  if v_row.native_language <> 'tr' or v_row.timezone <> 'Europe/Istanbul' then
    raise exception 'FAIL: profile defaults wrong: lang=% tz=%',
      v_row.native_language, v_row.timezone;
  end if;

  perform set_config('app.uid', v_user::text, false);

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
