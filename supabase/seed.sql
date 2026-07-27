-- =============================================================================
-- Synapse - development seed data
-- Run with: supabase db reset  (local)  |  psql -f supabase/seed.sql (remote)
--
-- Scope note: only the three exercise kinds the app actually renders are seeded
-- (multiple_choice, fill_blank, word_order). ExerciseRenderer falls back to a
-- "Coming soon" screen for anything else, so seeding match_pairs / listen_type /
-- speak_repeat would walk learners into a dead end.
--
-- For the same reason there are no `listening` or `speaking` lessons: both need
-- an audio pipeline and microphone capture that do not exist yet. Those two brain
-- regions therefore stay unfed - a real content gap, not an oversight, and the
-- planner will keep naming them as weakest until it is closed.
--
-- IDs are fixed so re-running is idempotent and existing user progress keeps
-- pointing at the same lessons.
-- =============================================================================

-- Courses ---------------------------------------------------------------------
insert into public.courses (id, slug, title, description, level, order_index, is_published)
values
  ('11111111-1111-1111-1111-111111111111', 'a1-foundations', 'A1 · Foundations',
   'Your first words, greetings and the present simple.', 'A1', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'a2-everyday', 'A2 · Everyday English',
   'Shopping, travel and talking about the past.', 'A2', 2, true)
on conflict (id) do nothing;

-- Units -----------------------------------------------------------------------
insert into public.units (id, course_id, title, description, order_index)
values
  ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Greetings', 'Say hello and introduce yourself.', 1),
  ('aaaaaaa1-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Numbers & Time', 'Count, tell the time, make plans.', 2),
  ('aaaaaaa1-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Everyday Things', 'Food, drink and ordering politely.', 3),
  ('aaaaaaa1-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'Around Town', 'Places, directions and where you live.', 4),
  ('aaaaaaa2-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'Shopping', 'Prices, comparisons and opinions.', 1),
  ('aaaaaaa2-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'Past Experiences', 'Talk about what already happened.', 2)
on conflict (id) do nothing;

-- Lessons ---------------------------------------------------------------------
insert into public.lessons (id, unit_id, title, kind, order_index, xp_reward, estimated_minutes, is_published)
values
  -- A1 - Greetings
  ('bbbbbbb1-0000-0000-0000-000000000001', 'aaaaaaa1-0000-0000-0000-000000000001',
   'Hello and goodbye', 'vocabulary', 1, 20, 5, true),
  ('bbbbbbb1-0000-0000-0000-000000000002', 'aaaaaaa1-0000-0000-0000-000000000001',
   'Introducing yourself', 'grammar', 2, 25, 6, true),
  ('bbbbbbb1-0000-0000-0000-000000000003', 'aaaaaaa1-0000-0000-0000-000000000001',
   'Where are you from?', 'reading', 3, 25, 5, true),
  -- A1 - Numbers & Time
  ('bbbbbbb1-0000-0000-0000-000000000004', 'aaaaaaa1-0000-0000-0000-000000000002',
   'Numbers 1 to 20', 'vocabulary', 1, 20, 4, true),
  ('bbbbbbb1-0000-0000-0000-000000000005', 'aaaaaaa1-0000-0000-0000-000000000002',
   'Telling the time', 'grammar', 2, 30, 7, true),
  ('bbbbbbb1-0000-0000-0000-000000000006', 'aaaaaaa1-0000-0000-0000-000000000002',
   'Days and months', 'vocabulary', 3, 20, 5, true),
  -- A1 - Everyday Things
  ('bbbbbbb1-0000-0000-0000-000000000007', 'aaaaaaa1-0000-0000-0000-000000000003',
   'Food and drink', 'vocabulary', 1, 20, 5, true),
  ('bbbbbbb1-0000-0000-0000-000000000008', 'aaaaaaa1-0000-0000-0000-000000000003',
   'In a cafe', 'reading', 2, 25, 6, true),
  ('bbbbbbb1-0000-0000-0000-000000000009', 'aaaaaaa1-0000-0000-0000-000000000003',
   'Writing a short note', 'writing', 3, 30, 7, true),
  -- A1 - Around Town
  ('bbbbbbb1-0000-0000-0000-000000000010', 'aaaaaaa1-0000-0000-0000-000000000004',
   'Places in a city', 'vocabulary', 1, 20, 5, true),
  ('bbbbbbb1-0000-0000-0000-000000000011', 'aaaaaaa1-0000-0000-0000-000000000004',
   'Asking for directions', 'grammar', 2, 30, 7, true),
  ('bbbbbbb1-0000-0000-0000-000000000012', 'aaaaaaa1-0000-0000-0000-000000000004',
   'My neighbourhood', 'writing', 3, 30, 8, true),
  -- A2 - Shopping
  ('bbbbbbb2-0000-0000-0000-000000000001', 'aaaaaaa2-0000-0000-0000-000000000001',
   'At the market', 'vocabulary', 1, 25, 5, true),
  ('bbbbbbb2-0000-0000-0000-000000000002', 'aaaaaaa2-0000-0000-0000-000000000001',
   'Comparing things', 'grammar', 2, 35, 8, true),
  ('bbbbbbb2-0000-0000-0000-000000000003', 'aaaaaaa2-0000-0000-0000-000000000001',
   'A product review', 'reading', 3, 30, 7, true),
  -- A2 - Past Experiences
  ('bbbbbbb2-0000-0000-0000-000000000004', 'aaaaaaa2-0000-0000-0000-000000000002',
   'The past simple', 'grammar', 1, 35, 8, true),
  ('bbbbbbb2-0000-0000-0000-000000000005', 'aaaaaaa2-0000-0000-0000-000000000002',
   'A trip I took', 'writing', 2, 35, 9, true),
  ('bbbbbbb2-0000-0000-0000-000000000006', 'aaaaaaa2-0000-0000-0000-000000000002',
   'Travel words', 'vocabulary', 3, 25, 5, true)
on conflict (id) do nothing;

-- Exercises -------------------------------------------------------------------
-- Three per lesson, rotating through the renderable kinds.
insert into public.exercises (id, lesson_id, kind, prompt, payload, order_index)
values
  -- L1 Hello and goodbye
  ('ccccccc1-0000-0000-0000-000000000101', 'bbbbbbb1-0000-0000-0000-000000000001', 'multiple_choice',
   'Which greeting fits the morning?',
   '{"options":[{"id":"a","label":"Good morning"},{"id":"b","label":"Good night"},{"id":"c","label":"See you"}],"correctOptionId":"a","explanation":"\"Good morning\" is used until about noon."}', 1),
  ('ccccccc1-0000-0000-0000-000000000102', 'bbbbbbb1-0000-0000-0000-000000000001', 'fill_blank',
   'Complete the sentence.',
   '{"template":"___ afternoon, Mr. Yilmaz.","answers":["good"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000103', 'bbbbbbb1-0000-0000-0000-000000000001', 'word_order',
   'Put the words in the right order.',
   '{"tokens":["nice","to","meet","you"],"correctOrder":[0,1,2,3]}', 3),

  -- L2 Introducing yourself
  ('ccccccc1-0000-0000-0000-000000000201', 'bbbbbbb1-0000-0000-0000-000000000002', 'multiple_choice',
   'Choose the correct form.',
   '{"options":[{"id":"a","label":"My name is Eda."},{"id":"b","label":"My name are Eda."},{"id":"c","label":"My name am Eda."}],"correctOptionId":"a","explanation":"A single name takes \"is\"."}', 1),
  ('ccccccc1-0000-0000-0000-000000000202', 'bbbbbbb1-0000-0000-0000-000000000002', 'fill_blank',
   'Complete with the correct verb.',
   '{"template":"I ___ a student.","answers":["am"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000203', 'bbbbbbb1-0000-0000-0000-000000000002', 'word_order',
   'Build the question.',
   '{"tokens":["what","is","your","name"],"correctOrder":[0,1,2,3]}', 3),

  -- L3 Where are you from?
  ('ccccccc1-0000-0000-0000-000000000301', 'bbbbbbb1-0000-0000-0000-000000000003', 'multiple_choice',
   'Read: "I am from Izmir, but I live in Ankara." Where does the speaker live now?',
   '{"options":[{"id":"a","label":"Ankara"},{"id":"b","label":"Izmir"},{"id":"c","label":"We do not know"}],"correctOptionId":"a","explanation":"\"Live in\" tells you the current city."}', 1),
  ('ccccccc1-0000-0000-0000-000000000302', 'bbbbbbb1-0000-0000-0000-000000000003', 'fill_blank',
   'Complete the question.',
   '{"template":"Where ___ you from?","answers":["are"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000303', 'bbbbbbb1-0000-0000-0000-000000000003', 'word_order',
   'Put the answer in order.',
   '{"tokens":["I","am","from","Turkey"],"correctOrder":[0,1,2,3]}', 3),

  -- L4 Numbers 1 to 20
  ('ccccccc1-0000-0000-0000-000000000401', 'bbbbbbb1-0000-0000-0000-000000000004', 'multiple_choice',
   'Which number is 12?',
   '{"options":[{"id":"a","label":"twelve"},{"id":"b","label":"twenty"},{"id":"c","label":"two"}],"correctOptionId":"a"}', 1),
  ('ccccccc1-0000-0000-0000-000000000402', 'bbbbbbb1-0000-0000-0000-000000000004', 'fill_blank',
   'Write the number as a word.',
   '{"template":"Seven plus eight is ___.","answers":["fifteen"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000403', 'bbbbbbb1-0000-0000-0000-000000000004', 'word_order',
   'Order the numbers from small to large.',
   '{"tokens":["three","nine","fourteen","nineteen"],"correctOrder":[0,1,2,3]}', 3),

  -- L5 Telling the time
  ('ccccccc1-0000-0000-0000-000000000501', 'bbbbbbb1-0000-0000-0000-000000000005', 'multiple_choice',
   'How do you say 07:30?',
   '{"options":[{"id":"a","label":"half past seven"},{"id":"b","label":"half to seven"},{"id":"c","label":"seven and half"}],"correctOptionId":"a","explanation":"Thirty minutes after the hour is \"half past\"."}', 1),
  ('ccccccc1-0000-0000-0000-000000000502', 'bbbbbbb1-0000-0000-0000-000000000005', 'fill_blank',
   'Complete the sentence.',
   '{"template":"The meeting starts ___ nine.","answers":["at"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000503', 'bbbbbbb1-0000-0000-0000-000000000005', 'word_order',
   'Build the question.',
   '{"tokens":["what","time","is","it"],"correctOrder":[0,1,2,3]}', 3),

  -- L6 Days and months
  ('ccccccc1-0000-0000-0000-000000000601', 'bbbbbbb1-0000-0000-0000-000000000006', 'multiple_choice',
   'Which day comes after Tuesday?',
   '{"options":[{"id":"a","label":"Wednesday"},{"id":"b","label":"Monday"},{"id":"c","label":"Thursday"}],"correctOptionId":"a"}', 1),
  ('ccccccc1-0000-0000-0000-000000000602', 'bbbbbbb1-0000-0000-0000-000000000006', 'fill_blank',
   'Complete with the right preposition.',
   '{"template":"My birthday is ___ May.","answers":["in"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000603', 'bbbbbbb1-0000-0000-0000-000000000006', 'word_order',
   'Order the months.',
   '{"tokens":["March","June","September","December"],"correctOrder":[0,1,2,3]}', 3),

  -- L7 Food and drink
  ('ccccccc1-0000-0000-0000-000000000701', 'bbbbbbb1-0000-0000-0000-000000000007', 'multiple_choice',
   'Which one is a drink?',
   '{"options":[{"id":"a","label":"tea"},{"id":"b","label":"bread"},{"id":"c","label":"cheese"}],"correctOptionId":"a"}', 1),
  ('ccccccc1-0000-0000-0000-000000000702', 'bbbbbbb1-0000-0000-0000-000000000007', 'fill_blank',
   'Complete the order.',
   '{"template":"I would like ___ glass of water.","answers":["a"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000703', 'bbbbbbb1-0000-0000-0000-000000000007', 'word_order',
   'Order the polite request.',
   '{"tokens":["can","I","have","the","menu"],"correctOrder":[0,1,2,3,4]}', 3),

  -- L8 In a cafe
  ('ccccccc1-0000-0000-0000-000000000801', 'bbbbbbb1-0000-0000-0000-000000000008', 'multiple_choice',
   'Read: "Sorry, we are out of milk today." What does the cafe not have?',
   '{"options":[{"id":"a","label":"milk"},{"id":"b","label":"coffee"},{"id":"c","label":"sugar"}],"correctOptionId":"a","explanation":"\"Out of\" means there is none left."}', 1),
  ('ccccccc1-0000-0000-0000-000000000802', 'bbbbbbb1-0000-0000-0000-000000000008', 'fill_blank',
   'Complete the reply.',
   '{"template":"That is fine, I will take it ___ milk.","answers":["without"]}', 2),
  ('ccccccc1-0000-0000-0000-000000000803', 'bbbbbbb1-0000-0000-0000-000000000008', 'word_order',
   'Order the question.',
   '{"tokens":["how","much","is","it"],"correctOrder":[0,1,2,3]}', 3),

  -- L9 Writing a short note
  ('ccccccc1-0000-0000-0000-000000000901', 'bbbbbbb1-0000-0000-0000-000000000009', 'fill_blank',
   'Finish the note opening.',
   '{"template":"___ Ayse, I am at the library.","answers":["hi","hello","dear"]}', 1),
  ('ccccccc1-0000-0000-0000-000000000902', 'bbbbbbb1-0000-0000-0000-000000000009', 'word_order',
   'Order the closing line.',
   '{"tokens":["see","you","later"],"correctOrder":[0,1,2]}', 2),
  ('ccccccc1-0000-0000-0000-000000000903', 'bbbbbbb1-0000-0000-0000-000000000009', 'multiple_choice',
   'Which closing fits a note to a friend?',
   '{"options":[{"id":"a","label":"See you soon"},{"id":"b","label":"Yours faithfully"},{"id":"c","label":"To whom it may concern"}],"correctOptionId":"a","explanation":"The other two belong in formal letters."}', 3),

  -- L10 Places in a city
  ('ccccccc1-0000-0000-0000-000000001001', 'bbbbbbb1-0000-0000-0000-000000000010', 'multiple_choice',
   'Where do you borrow books?',
   '{"options":[{"id":"a","label":"library"},{"id":"b","label":"pharmacy"},{"id":"c","label":"station"}],"correctOptionId":"a"}', 1),
  ('ccccccc1-0000-0000-0000-000000001002', 'bbbbbbb1-0000-0000-0000-000000000010', 'fill_blank',
   'Complete the sentence.',
   '{"template":"There is a bank ___ the corner.","answers":["on"]}', 2),
  ('ccccccc1-0000-0000-0000-000000001003', 'bbbbbbb1-0000-0000-0000-000000000010', 'word_order',
   'Order the sentence.',
   '{"tokens":["the","museum","is","near","here"],"correctOrder":[0,1,2,3,4]}', 3),

  -- L11 Asking for directions
  ('ccccccc1-0000-0000-0000-000000001101', 'bbbbbbb1-0000-0000-0000-000000000011', 'multiple_choice',
   'Which question asks for directions?',
   '{"options":[{"id":"a","label":"How do I get to the station?"},{"id":"b","label":"How are you today?"},{"id":"c","label":"How much is the ticket?"}],"correctOptionId":"a"}', 1),
  ('ccccccc1-0000-0000-0000-000000001102', 'bbbbbbb1-0000-0000-0000-000000000011', 'fill_blank',
   'Complete the direction.',
   '{"template":"Go straight and then turn ___.","answers":["left","right"]}', 2),
  ('ccccccc1-0000-0000-0000-000000001103', 'bbbbbbb1-0000-0000-0000-000000000011', 'word_order',
   'Order the polite opener.',
   '{"tokens":["excuse","me","where","is","the","exit"],"correctOrder":[0,1,2,3,4,5]}', 3),

  -- L12 My neighbourhood
  ('ccccccc1-0000-0000-0000-000000001201', 'bbbbbbb1-0000-0000-0000-000000000012', 'fill_blank',
   'Describe where you live.',
   '{"template":"I live ___ a quiet street.","answers":["on","in"]}', 1),
  ('ccccccc1-0000-0000-0000-000000001202', 'bbbbbbb1-0000-0000-0000-000000000012', 'multiple_choice',
   'Which sentence describes a place?',
   '{"options":[{"id":"a","label":"My street is busy in the morning."},{"id":"b","label":"I am busy in the morning."},{"id":"c","label":"I go by bus."}],"correctOptionId":"a"}', 2),
  ('ccccccc1-0000-0000-0000-000000001203', 'bbbbbbb1-0000-0000-0000-000000000012', 'word_order',
   'Order the description.',
   '{"tokens":["there","are","two","parks","nearby"],"correctOrder":[0,1,2,3,4]}', 3),

  -- A2 L13 At the market
  ('ccccccc2-0000-0000-0000-000000000101', 'bbbbbbb2-0000-0000-0000-000000000001', 'multiple_choice',
   'Which word means the money you pay?',
   '{"options":[{"id":"a","label":"price"},{"id":"b","label":"prize"},{"id":"c","label":"praise"}],"correctOptionId":"a","explanation":"A prize is something you win."}', 1),
  ('ccccccc2-0000-0000-0000-000000000102', 'bbbbbbb2-0000-0000-0000-000000000001', 'fill_blank',
   'Complete the question.',
   '{"template":"How ___ do the apples cost?","answers":["much"]}', 2),
  ('ccccccc2-0000-0000-0000-000000000103', 'bbbbbbb2-0000-0000-0000-000000000001', 'word_order',
   'Order the request.',
   '{"tokens":["I","will","take","two","kilos"],"correctOrder":[0,1,2,3,4]}', 3),

  -- A2 L14 Comparing things
  ('ccccccc2-0000-0000-0000-000000000201', 'bbbbbbb2-0000-0000-0000-000000000002', 'multiple_choice',
   'Choose the correct comparative.',
   '{"options":[{"id":"a","label":"This bag is cheaper than that one."},{"id":"b","label":"This bag is more cheap than that one."},{"id":"c","label":"This bag is cheapest than that one."}],"correctOptionId":"a","explanation":"Short adjectives take -er, not \"more\"."}', 1),
  ('ccccccc2-0000-0000-0000-000000000202', 'bbbbbbb2-0000-0000-0000-000000000002', 'fill_blank',
   'Complete with the superlative.',
   '{"template":"It is the ___ shop in the city.","answers":["biggest"]}', 2),
  ('ccccccc2-0000-0000-0000-000000000203', 'bbbbbbb2-0000-0000-0000-000000000002', 'word_order',
   'Order the comparison.',
   '{"tokens":["the","train","is","faster","than","the","bus"],"correctOrder":[0,1,2,3,4,5,6]}', 3),

  -- A2 L15 A product review
  ('ccccccc2-0000-0000-0000-000000000301', 'bbbbbbb2-0000-0000-0000-000000000003', 'multiple_choice',
   'Read: "The battery lasts all day, but the screen scratches easily." What is the problem?',
   '{"options":[{"id":"a","label":"the screen"},{"id":"b","label":"the battery"},{"id":"c","label":"the price"}],"correctOptionId":"a","explanation":"\"But\" introduces the drawback."}', 1),
  ('ccccccc2-0000-0000-0000-000000000302', 'bbbbbbb2-0000-0000-0000-000000000003', 'fill_blank',
   'Complete the opinion.',
   '{"template":"Overall I would ___ it to a friend.","answers":["recommend"]}', 2),
  ('ccccccc2-0000-0000-0000-000000000303', 'bbbbbbb2-0000-0000-0000-000000000003', 'word_order',
   'Order the verdict.',
   '{"tokens":["it","is","worth","the","money"],"correctOrder":[0,1,2,3,4]}', 3),

  -- A2 L16 The past simple
  ('ccccccc2-0000-0000-0000-000000000401', 'bbbbbbb2-0000-0000-0000-000000000004', 'multiple_choice',
   'Choose the past simple.',
   '{"options":[{"id":"a","label":"I went to Bursa last week."},{"id":"b","label":"I go to Bursa last week."},{"id":"c","label":"I am going to Bursa last week."}],"correctOptionId":"a","explanation":"\"Last week\" needs a past form."}', 1),
  ('ccccccc2-0000-0000-0000-000000000402', 'bbbbbbb2-0000-0000-0000-000000000004', 'fill_blank',
   'Put the verb in the past.',
   '{"template":"We ___ dinner at eight yesterday.","answers":["had"]}', 2),
  ('ccccccc2-0000-0000-0000-000000000403', 'bbbbbbb2-0000-0000-0000-000000000004', 'word_order',
   'Order the past question.',
   '{"tokens":["did","you","see","the","film"],"correctOrder":[0,1,2,3,4]}', 3),

  -- A2 L17 A trip I took
  ('ccccccc2-0000-0000-0000-000000000501', 'bbbbbbb2-0000-0000-0000-000000000005', 'fill_blank',
   'Start the story.',
   '{"template":"Last summer I ___ to the coast.","answers":["travelled","traveled","went"]}', 1),
  ('ccccccc2-0000-0000-0000-000000000502', 'bbbbbbb2-0000-0000-0000-000000000005', 'word_order',
   'Order the detail.',
   '{"tokens":["we","stayed","there","for","five","days"],"correctOrder":[0,1,2,3,4,5]}', 2),
  ('ccccccc2-0000-0000-0000-000000000503', 'bbbbbbb2-0000-0000-0000-000000000005', 'multiple_choice',
   'Which sentence closes a short story best?',
   '{"options":[{"id":"a","label":"I would go back tomorrow."},{"id":"b","label":"I will go yesterday."},{"id":"c","label":"I am going last year."}],"correctOptionId":"a"}', 3),

  -- A2 L18 Travel words
  ('ccccccc2-0000-0000-0000-000000000601', 'bbbbbbb2-0000-0000-0000-000000000006', 'multiple_choice',
   'Where do you wait for a plane?',
   '{"options":[{"id":"a","label":"gate"},{"id":"b","label":"platform"},{"id":"c","label":"stop"}],"correctOptionId":"a","explanation":"Platforms are for trains, stops for buses."}', 1),
  ('ccccccc2-0000-0000-0000-000000000602', 'bbbbbbb2-0000-0000-0000-000000000006', 'fill_blank',
   'Complete the sentence.',
   '{"template":"I need to ___ in at the airport.","answers":["check"]}', 2),
  ('ccccccc2-0000-0000-0000-000000000603', 'bbbbbbb2-0000-0000-0000-000000000006', 'word_order',
   'Order the announcement.',
   '{"tokens":["the","flight","is","delayed","by","one","hour"],"correctOrder":[0,1,2,3,4,5,6]}', 3)
on conflict (id) do nothing;

-- Vocabulary ------------------------------------------------------------------
-- Turkish translations, because profiles.native_language defaults to 'tr'.
insert into public.vocabulary_items (headword, phonetic, meaning, translation, example_sentence, level, tags)
values
  -- A1 - greetings and people
  ('greeting', '/ˈɡriː.tɪŋ/', 'Something you say when you meet someone.', 'selamlama', 'A friendly greeting goes a long way.', 'A1', array['social']),
  ('introduce', '/ˌɪn.trəˈdjuːs/', 'To tell someone your name for the first time.', 'tanıtmak', 'Let me introduce myself.', 'A1', array['social']),
  ('afternoon', '/ˌɑːf.təˈnuːn/', 'The time between noon and evening.', 'öğleden sonra', 'See you in the afternoon.', 'A1', array['time']),
  ('name', '/neɪm/', 'What a person is called.', 'isim', 'What is your name?', 'A1', array['social']),
  ('friend', '/frend/', 'Someone you like and know well.', 'arkadaş', 'She is my closest friend.', 'A1', array['social']),
  ('neighbour', '/ˈneɪ.bər/', 'A person who lives next to you.', 'komşu', 'Our neighbour is very quiet.', 'A1', array['social','places']),
  ('please', '/pliːz/', 'A polite word used when asking.', 'lütfen', 'One coffee, please.', 'A1', array['social']),
  ('sorry', '/ˈsɒr.i/', 'A word used to apologise.', 'özür dilerim', 'Sorry, I am late.', 'A1', array['social']),
  -- A1 - numbers and time
  ('number', '/ˈnʌm.bər/', 'A word or sign that shows how many.', 'sayı', 'Pick a number from one to ten.', 'A1', array['numbers']),
  ('twelve', '/twelv/', 'The number 12.', 'on iki', 'The shop opens at twelve.', 'A1', array['numbers']),
  ('fifteen', '/ˌfɪfˈtiːn/', 'The number 15.', 'on beş', 'It takes fifteen minutes.', 'A1', array['numbers']),
  ('hour', '/aʊər/', 'Sixty minutes.', 'saat', 'The lesson lasts one hour.', 'A1', array['time']),
  ('minute', '/ˈmɪn.ɪt/', 'Sixty seconds.', 'dakika', 'Wait a minute, please.', 'A1', array['time']),
  ('week', '/wiːk/', 'Seven days.', 'hafta', 'I study every week.', 'A1', array['time']),
  ('month', '/mʌnθ/', 'One of the twelve parts of a year.', 'ay', 'May is my favourite month.', 'A1', array['time']),
  ('today', '/təˈdeɪ/', 'This day.', 'bugün', 'Today is Wednesday.', 'A1', array['time']),
  ('tomorrow', '/təˈmɒr.əʊ/', 'The day after today.', 'yarın', 'See you tomorrow.', 'A1', array['time']),
  -- A1 - food and drink
  ('bread', '/bred/', 'A basic food made from flour.', 'ekmek', 'We need fresh bread.', 'A1', array['food']),
  ('water', '/ˈwɔː.tər/', 'A clear drink with no taste.', 'su', 'A glass of water, please.', 'A1', array['food']),
  ('tea', '/tiː/', 'A hot drink made from leaves.', 'çay', 'She drinks tea in the morning.', 'A1', array['food']),
  ('coffee', '/ˈkɒf.i/', 'A hot drink made from beans.', 'kahve', 'The coffee here is very good.', 'A1', array['food']),
  ('cheese', '/tʃiːz/', 'A food made from milk.', 'peynir', 'I would like cheese on it.', 'A1', array['food']),
  ('breakfast', '/ˈbrek.fəst/', 'The first meal of the day.', 'kahvaltı', 'Breakfast is at eight.', 'A1', array['food']),
  ('menu', '/ˈmen.juː/', 'A list of food in a restaurant.', 'menü', 'Can I see the menu?', 'A1', array['food']),
  ('bill', '/bɪl/', 'A paper showing what you must pay.', 'hesap', 'Could we have the bill?', 'A1', array['food','money']),
  -- A1 - places and directions
  ('library', '/ˈlaɪ.brər.i/', 'A place where you borrow books.', 'kütüphane', 'The library closes at six.', 'A1', array['places']),
  ('station', '/ˈsteɪ.ʃən/', 'A place where trains stop.', 'istasyon', 'The station is near here.', 'A1', array['places','travel']),
  ('market', '/ˈmɑː.kɪt/', 'A place where people sell food and goods.', 'pazar', 'The market opens early.', 'A1', array['places','money']),
  ('pharmacy', '/ˈfɑː.mə.si/', 'A shop that sells medicine.', 'eczane', 'Is there a pharmacy nearby?', 'A1', array['places']),
  ('museum', '/mjuːˈziː.əm/', 'A building that shows old or important things.', 'müze', 'The museum is free on Sunday.', 'A1', array['places']),
  ('street', '/striːt/', 'A road in a town with houses.', 'sokak', 'I live on a quiet street.', 'A1', array['places']),
  ('corner', '/ˈkɔː.nər/', 'The point where two streets meet.', 'köşe', 'The bank is on the corner.', 'A1', array['places']),
  ('left', '/left/', 'The side opposite to right.', 'sol', 'Turn left at the lights.', 'A1', array['directions']),
  ('right', '/raɪt/', 'The side opposite to left.', 'sağ', 'Take the second right.', 'A1', array['directions']),
  ('straight', '/streɪt/', 'Without turning.', 'düz', 'Go straight for two minutes.', 'A1', array['directions']),
  ('near', '/nɪər/', 'Not far away.', 'yakın', 'The park is near the school.', 'A1', array['directions']),
  ('busy', '/ˈbɪz.i/', 'Full of people or activity.', 'kalabalık', 'The street is busy at noon.', 'A1', array['describing']),
  ('quiet', '/ˈkwaɪ.ət/', 'With little noise.', 'sessiz', 'It is a quiet neighbourhood.', 'A1', array['describing']),
  ('early', '/ˈɜː.li/', 'Before the usual time.', 'erken', 'I wake up early.', 'A1', array['time']),
  ('late', '/leɪt/', 'After the usual time.', 'geç', 'The bus is late again.', 'A1', array['time']),
  -- A2 - shopping and opinions
  ('price', '/praɪs/', 'The money you pay for something.', 'fiyat', 'The price went up.', 'A2', array['money']),
  ('cheap', '/tʃiːp/', 'Costing little money.', 'ucuz', 'This bag is cheaper.', 'A2', array['money','describing']),
  ('expensive', '/ɪkˈspen.sɪv/', 'Costing a lot of money.', 'pahalı', 'That phone is too expensive.', 'A2', array['money','describing']),
  ('discount', '/ˈdɪs.kaʊnt/', 'An amount taken off the price.', 'indirim', 'There is a discount today.', 'A2', array['money']),
  ('receipt', '/rɪˈsiːt/', 'A paper proving you paid.', 'fiş', 'Keep the receipt.', 'A2', array['money']),
  ('recommend', '/ˌrek.əˈmend/', 'To say something is good.', 'önermek', 'I would recommend it.', 'A2', array['opinion']),
  ('review', '/rɪˈvjuː/', 'A written opinion about something.', 'değerlendirme', 'I read the reviews first.', 'A2', array['opinion']),
  ('quality', '/ˈkwɒl.ə.ti/', 'How good something is.', 'kalite', 'The quality is excellent.', 'A2', array['opinion']),
  -- A2 - travel and the past
  ('journey', '/ˈdʒɜː.ni/', 'A trip from one place to another.', 'yolculuk', 'It was a long journey.', 'A2', array['travel']),
  ('flight', '/flaɪt/', 'A trip by plane.', 'uçuş', 'The flight is delayed.', 'A2', array['travel']),
  ('gate', '/ɡeɪt/', 'The place where you board a plane.', 'kapı', 'We are at gate 22.', 'A2', array['travel']),
  ('luggage', '/ˈlʌɡ.ɪdʒ/', 'The bags you travel with.', 'bagaj', 'My luggage is heavy.', 'A2', array['travel']),
  ('delayed', '/dɪˈleɪd/', 'Happening later than planned.', 'gecikmiş', 'The train was delayed.', 'A2', array['travel']),
  ('arrive', '/əˈraɪv/', 'To reach a place.', 'varmak', 'We arrived at midnight.', 'A2', array['travel']),
  ('yesterday', '/ˈjes.tə.deɪ/', 'The day before today.', 'dün', 'I saw him yesterday.', 'A2', array['time'])
on conflict (headword, level) do nothing;
