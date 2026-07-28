-- =============================================================================
-- Synapse - development seed data
-- Run with: supabase db reset  (local)  |  psql -f supabase/seed.sql (remote)
-- =============================================================================

insert into public.courses (id, slug, title, description, level, order_index, is_published)
values
  ('11111111-1111-1111-1111-111111111111', 'a1-foundations', 'A1 · Foundations',
   'Your first words, greetings and the present simple.', 'A1', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'a2-everyday', 'A2 · Everyday English',
   'Shopping, travel and talking about the past.', 'A2', 2, true)
on conflict (id) do nothing;

insert into public.units (id, course_id, title, description, order_index)
values
  ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Greetings', 'Say hello and introduce yourself.', 1),
  ('aaaaaaa1-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Numbers & Time', 'Count, tell the time, make plans.', 2)
on conflict (id) do nothing;

insert into public.lessons (id, unit_id, title, kind, order_index, xp_reward, estimated_minutes, is_published)
values
  ('bbbbbbb1-0000-0000-0000-000000000001', 'aaaaaaa1-0000-0000-0000-000000000001',
   'Hello and goodbye', 'vocabulary', 1, 20, 5, true),
  ('bbbbbbb1-0000-0000-0000-000000000002', 'aaaaaaa1-0000-0000-0000-000000000001',
   'Introducing yourself', 'grammar', 2, 25, 6, true)
on conflict (id) do nothing;

insert into public.exercises (lesson_id, kind, prompt, payload, order_index)
values
  ('bbbbbbb1-0000-0000-0000-000000000001', 'multiple_choice',
   'Which greeting fits the morning?',
   '{"options":[{"id":"a","label":"Good morning"},{"id":"b","label":"Good night"},{"id":"c","label":"See you"}],"correctOptionId":"a","explanation":"\"Good morning\" is used until about noon."}',
   1),
  ('bbbbbbb1-0000-0000-0000-000000000001', 'fill_blank',
   'Complete the sentence.',
   '{"template":"___ afternoon, Mr. Yilmaz.","answers":["good"]}',
   2),
  ('bbbbbbb1-0000-0000-0000-000000000001', 'word_order',
   'Put the words in the right order.',
   '{"tokens":["nice","to","meet","you"],"correctOrder":[0,1,2,3]}',
   3)
on conflict do nothing;

-- Lesson 2 exercises the remaining kinds, one of each.
insert into public.exercises (id, lesson_id, kind, prompt, payload, audio_url, order_index)
values
  ('ccccccc1-0000-0000-0000-000000000001', 'bbbbbbb1-0000-0000-0000-000000000002', 'match_pairs',
   'Match each phrase with its Turkish meaning.',
   '{"pairs":[{"left":"My name is…","right":"Benim adım…"},{"left":"Nice to meet you","right":"Tanıştığımıza memnun oldum"},{"left":"Where are you from?","right":"Nerelisin?"},{"left":"I am from Türkiye","right":"Ben Türkiyeliyim"}]}',
   null, 1),
  ('ccccccc1-0000-0000-0000-000000000002', 'bbbbbbb1-0000-0000-0000-000000000002', 'translate',
   'Translate the sentence.',
   '{"sourceText":"Merhaba, benim adım Ayşe.","acceptedAnswers":["Hello, my name is Ayse.","Hi, my name is Ayse.","Hello, my name is Ayşe."],"direction":"tr-en"}',
   null, 2),
  ('ccccccc1-0000-0000-0000-000000000003', 'bbbbbbb1-0000-0000-0000-000000000002', 'listen_type',
   'Type what you hear.',
   '{"expectedText":"Where are you from?","tolerance":1}',
   -- Point this at a clip in your Supabase storage bucket. With no clip (or no
   -- audio driver registered) the exercise degrades to a spelling drill.
   null, 3),
  ('ccccccc1-0000-0000-0000-000000000004', 'bbbbbbb1-0000-0000-0000-000000000002', 'speak_repeat',
   'Say the sentence out loud.',
   '{"expectedText":"Nice to meet you.","minConfidence":0.6}',
   null, 4)
on conflict (id) do nothing;

insert into public.vocabulary_items (headword, phonetic, meaning, translation, example_sentence, level, tags)
values
  ('greeting', '/ˈɡriː.tɪŋ/', 'Something you say when you meet someone.', 'selamlama',
   'A friendly greeting goes a long way.', 'A1', array['social']),
  ('introduce', '/ˌɪn.trəˈdjuːs/', 'To tell someone your name for the first time.', 'tanıtmak',
   'Let me introduce myself.', 'A1', array['social']),
  ('afternoon', '/ˌɑːf.təˈnuːn/', 'The time between noon and evening.', 'öğleden sonra',
   'See you in the afternoon.', 'A1', array['time'])
on conflict (headword, level) do nothing;

-- Wire the first lesson's words into the review queue on completion. The seed
-- vocabulary has no fixed ids, so match on (headword, level) instead.
insert into public.lesson_vocabulary (lesson_id, vocabulary_id, order_index)
select 'bbbbbbb1-0000-0000-0000-000000000001', v.id,
       row_number() over (order by v.headword)
  from public.vocabulary_items v
  where v.level = 'A1'
    and v.headword in ('greeting', 'introduce', 'afternoon')
on conflict do nothing;
