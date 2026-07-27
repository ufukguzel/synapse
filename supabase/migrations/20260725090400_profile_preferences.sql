-- =============================================================================
-- Synapse - profile preferences
--
-- The settings screen needs somewhere to keep the learner's choices. `profiles`
-- already had `native_language`, but nothing recorded *which language is being
-- learned* (the app was implicitly English-only) or how the interface should be
-- localised, so both are added here rather than kept only on the device - they
-- have to survive a reinstall and follow the account.
-- =============================================================================

alter table public.profiles
  add column if not exists learning_language text not null default 'en',
  add column if not exists ui_language       text not null default 'tr',
  -- Local time of day for the streak reminder, e.g. '20:00'. Null = no reminder.
  add column if not exists reminder_time     time,
  add column if not exists notifications_enabled boolean not null default false,
  add column if not exists sound_enabled     boolean not null default true,
  add column if not exists haptics_enabled   boolean not null default true;

comment on column public.profiles.learning_language is
  'ISO 639-1 code of the language being studied. Content exists for ''en'' today.';
comment on column public.profiles.ui_language is
  'ISO 639-1 code for interface copy. Independent of learning_language.';

-- Guard against typos writing unusable codes.
alter table public.profiles
  drop constraint if exists profiles_learning_language_len;
alter table public.profiles
  add constraint profiles_learning_language_len check (char_length(learning_language) between 2 and 5);

alter table public.profiles
  drop constraint if exists profiles_ui_language_len;
alter table public.profiles
  add constraint profiles_ui_language_len check (char_length(ui_language) between 2 and 5);
