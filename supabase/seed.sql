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

insert into public.exercises (id, lesson_id, kind, prompt, payload, order_index)
values
  ('ccccccc0-0000-0000-0000-000000000001', 'bbbbbbb1-0000-0000-0000-000000000001', 'multiple_choice',
   'Which greeting fits the morning?',
   '{"options":[{"id":"a","label":"Good morning"},{"id":"b","label":"Good night"},{"id":"c","label":"See you"}],"correctOptionId":"a","explanation":"\"Good morning\" is used until about noon."}',
   1),
  ('ccccccc0-0000-0000-0000-000000000002', 'bbbbbbb1-0000-0000-0000-000000000001', 'fill_blank',
   'Complete the sentence.',
   '{"template":"___ afternoon, Mr. Yilmaz.","answers":["good"]}',
   2),
  ('ccccccc0-0000-0000-0000-000000000003', 'bbbbbbb1-0000-0000-0000-000000000001', 'word_order',
   'Put the words in the right order.',
   '{"tokens":["nice","to","meet","you"],"correctOrder":[0,1,2,3]}',
   3)
on conflict (id) do nothing;

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

-- =============================================================================
-- Library expansion — more units, lessons, exercises and vocabulary.
-- Existing A1 lessons 1 & 2 are left untouched (tests depend on them).
-- =============================================================================

-- A1 · Numbers & Time — two new lessons in the existing unit -------------------
insert into public.lessons (id, unit_id, title, kind, order_index, xp_reward, estimated_minutes, is_published)
values
  ('bbbbbbb1-0000-0000-0000-000000000003', 'aaaaaaa1-0000-0000-0000-000000000002',
   'Counting to ten', 'vocabulary', 1, 20, 5, true),
  ('bbbbbbb1-0000-0000-0000-000000000004', 'aaaaaaa1-0000-0000-0000-000000000002',
   'Telling the time', 'grammar', 2, 25, 6, true)
on conflict (id) do nothing;

-- A2 · Everyday English — two new units, four lessons -------------------------
insert into public.units (id, course_id, title, description, order_index)
values
  ('aaaaaaa2-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'Shopping', 'Buy things, talk about prices.', 1),
  ('aaaaaaa2-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'Travel', 'Airports, tickets and directions.', 2)
on conflict (id) do nothing;

insert into public.lessons (id, unit_id, title, kind, order_index, xp_reward, estimated_minutes, is_published)
values
  ('bbbbbbb2-0000-0000-0000-000000000001', 'aaaaaaa2-0000-0000-0000-000000000001',
   'At the market', 'vocabulary', 1, 25, 6, true),
  ('bbbbbbb2-0000-0000-0000-000000000002', 'aaaaaaa2-0000-0000-0000-000000000001',
   'Prices and money', 'grammar', 2, 30, 7, true),
  ('bbbbbbb2-0000-0000-0000-000000000003', 'aaaaaaa2-0000-0000-0000-000000000002',
   'At the airport', 'vocabulary', 1, 25, 6, true),
  ('bbbbbbb2-0000-0000-0000-000000000004', 'aaaaaaa2-0000-0000-0000-000000000002',
   'Asking directions', 'grammar', 2, 30, 7, true)
on conflict (id) do nothing;

-- Exercises for the new lessons (explicit ids → idempotent) -------------------
insert into public.exercises (id, lesson_id, kind, prompt, payload, order_index)
values
  -- A1 · Counting to ten
  ('ccccccc2-0000-0000-0000-000000000001', 'bbbbbbb1-0000-0000-0000-000000000003', 'multiple_choice',
   'Which number comes after two?',
   '{"options":[{"id":"a","label":"one"},{"id":"b","label":"three"},{"id":"c","label":"five"}],"correctOptionId":"b","explanation":"One, two, three."}', 1),
  ('ccccccc2-0000-0000-0000-000000000002', 'bbbbbbb1-0000-0000-0000-000000000003', 'word_order',
   'Put the words in the right order.',
   '{"tokens":["I","have","three","books"],"correctOrder":[0,1,2,3]}', 2),
  ('ccccccc2-0000-0000-0000-000000000003', 'bbbbbbb1-0000-0000-0000-000000000003', 'match_pairs',
   'Match the number with its Turkish name.',
   '{"pairs":[{"left":"one","right":"bir"},{"left":"two","right":"iki"},{"left":"three","right":"üç"},{"left":"ten","right":"on"}]}', 3),
  -- A1 · Telling the time
  ('ccccccc3-0000-0000-0000-000000000001', 'bbbbbbb1-0000-0000-0000-000000000004', 'multiple_choice',
   'How many minutes are in an hour?',
   '{"options":[{"id":"a","label":"30"},{"id":"b","label":"60"},{"id":"c","label":"100"}],"correctOptionId":"b","explanation":"Sixty minutes make one hour."}', 1),
  ('ccccccc3-0000-0000-0000-000000000002', 'bbbbbbb1-0000-0000-0000-000000000004', 'fill_blank',
   'Complete the sentence.',
   '{"template":"There are sixty ___ in an hour.","answers":["minutes"]}', 2),
  ('ccccccc3-0000-0000-0000-000000000003', 'bbbbbbb1-0000-0000-0000-000000000004', 'translate',
   'Translate the greeting.',
   '{"sourceText":"Günaydın.","acceptedAnswers":["Good morning","Good morning."],"direction":"tr-en"}', 3),
  -- A2 · At the market
  ('ccccccc4-0000-0000-0000-000000000001', 'bbbbbbb2-0000-0000-0000-000000000001', 'multiple_choice',
   'Where do you buy fresh vegetables?',
   '{"options":[{"id":"a","label":"market"},{"id":"b","label":"airport"},{"id":"c","label":"library"}],"correctOptionId":"a"}', 1),
  ('ccccccc4-0000-0000-0000-000000000002', 'bbbbbbb2-0000-0000-0000-000000000001', 'match_pairs',
   'Match each word with its Turkish meaning.',
   '{"pairs":[{"left":"market","right":"pazar"},{"left":"price","right":"fiyat"},{"left":"money","right":"para"},{"left":"cheap","right":"ucuz"}]}', 2),
  ('ccccccc4-0000-0000-0000-000000000003', 'bbbbbbb2-0000-0000-0000-000000000001', 'word_order',
   'Put the words in the right order.',
   '{"tokens":["how","much","is","this"],"correctOrder":[0,1,2,3]}', 3),
  -- A2 · Prices and money
  ('ccccccc5-0000-0000-0000-000000000001', 'bbbbbbb2-0000-0000-0000-000000000002', 'fill_blank',
   'Complete the sentence.',
   '{"template":"That is too ___, I cannot afford it.","answers":["expensive"]}', 1),
  ('ccccccc5-0000-0000-0000-000000000002', 'bbbbbbb2-0000-0000-0000-000000000002', 'multiple_choice',
   'Which word means not expensive?',
   '{"options":[{"id":"a","label":"cheap"},{"id":"b","label":"rich"},{"id":"c","label":"large"}],"correctOptionId":"a"}', 2),
  ('ccccccc5-0000-0000-0000-000000000003', 'bbbbbbb2-0000-0000-0000-000000000002', 'translate',
   'Translate the question.',
   '{"sourceText":"Bu ne kadar?","acceptedAnswers":["How much is this","How much is it","How much is this?"],"direction":"tr-en"}', 3),
  -- A2 · At the airport
  ('ccccccc6-0000-0000-0000-000000000001', 'bbbbbbb2-0000-0000-0000-000000000003', 'multiple_choice',
   'What do you need to board a plane?',
   '{"options":[{"id":"a","label":"a ticket"},{"id":"b","label":"a spoon"},{"id":"c","label":"a pillow"}],"correctOptionId":"a"}', 1),
  ('ccccccc6-0000-0000-0000-000000000002', 'bbbbbbb2-0000-0000-0000-000000000003', 'match_pairs',
   'Match each word with its Turkish meaning.',
   '{"pairs":[{"left":"airport","right":"havalimanı"},{"left":"ticket","right":"bilet"},{"left":"passport","right":"pasaport"},{"left":"luggage","right":"bagaj"}]}', 2),
  ('ccccccc6-0000-0000-0000-000000000003', 'bbbbbbb2-0000-0000-0000-000000000003', 'listen_type',
   'Type what you hear.',
   '{"expectedText":"Where is the gate?","tolerance":1}', 3),
  -- A2 · Asking directions
  ('ccccccc7-0000-0000-0000-000000000001', 'bbbbbbb2-0000-0000-0000-000000000004', 'fill_blank',
   'Complete the sentence.',
   '{"template":"Turn ___ at the corner.","answers":["left","right"]}', 1),
  ('ccccccc7-0000-0000-0000-000000000002', 'bbbbbbb2-0000-0000-0000-000000000004', 'word_order',
   'Put the words in the right order.',
   '{"tokens":["where","is","the","station"],"correctOrder":[0,1,2,3]}', 2),
  ('ccccccc7-0000-0000-0000-000000000003', 'bbbbbbb2-0000-0000-0000-000000000004', 'speak_repeat',
   'Say the sentence out loud.',
   '{"expectedText":"Go straight ahead.","minConfidence":0.6}', 3)
on conflict (id) do nothing;

-- New vocabulary ---------------------------------------------------------------
insert into public.vocabulary_items (headword, phonetic, meaning, translation, example_sentence, level, tags)
values
  ('one',   '/wʌn/',   'The number 1.', 'bir', 'I have one brother.', 'A1', array['number']),
  ('two',   '/tuː/',   'The number 2.', 'iki', 'Two coffees, please.', 'A1', array['number']),
  ('three', '/θriː/',  'The number 3.', 'üç',  'Three little birds.', 'A1', array['number']),
  ('minute','/ˈmɪn.ɪt/','Sixty seconds.', 'dakika', 'Wait a minute.', 'A1', array['time']),
  ('market','/ˈmɑː.kɪt/','A place to buy food and goods.', 'pazar', 'The market opens early.', 'A2', array['shopping']),
  ('price', '/praɪs/', 'How much something costs.', 'fiyat', 'The price is too high.', 'A2', array['shopping']),
  ('money', '/ˈmʌn.i/','Coins and notes you pay with.', 'para', 'I have no money.', 'A2', array['shopping']),
  ('cheap', '/tʃiːp/', 'Not expensive.', 'ucuz', 'This shirt is cheap.', 'A2', array['shopping']),
  ('expensive','/ɪkˈspen.sɪv/','Costs a lot.', 'pahalı', 'Cars are expensive.', 'A2', array['shopping']),
  ('airport','/ˈeə.pɔːt/','Where planes take off and land.', 'havalimanı', 'Meet me at the airport.', 'A2', array['travel']),
  ('ticket','/ˈtɪk.ɪt/','A pass to travel or enter.', 'bilet', 'Buy a ticket first.', 'A2', array['travel']),
  ('passport','/ˈpɑːs.pɔːt/','A document for international travel.', 'pasaport', 'Show your passport.', 'A2', array['travel'])
on conflict (headword, level) do nothing;

-- Wire the new vocabulary lessons to their words ------------------------------
insert into public.lesson_vocabulary (lesson_id, vocabulary_id, order_index)
select 'bbbbbbb1-0000-0000-0000-000000000003', v.id, row_number() over (order by v.headword)
  from public.vocabulary_items v
  where v.level = 'A1' and v.headword in ('one', 'two', 'three')
on conflict do nothing;

insert into public.lesson_vocabulary (lesson_id, vocabulary_id, order_index)
select 'bbbbbbb2-0000-0000-0000-000000000001', v.id, row_number() over (order by v.headword)
  from public.vocabulary_items v
  where v.level = 'A2' and v.headword in ('market', 'price', 'money')
on conflict do nothing;

insert into public.lesson_vocabulary (lesson_id, vocabulary_id, order_index)
select 'bbbbbbb2-0000-0000-0000-000000000003', v.id, row_number() over (order by v.headword)
  from public.vocabulary_items v
  where v.level = 'A2' and v.headword in ('airport', 'ticket', 'passport')
on conflict do nothing;
