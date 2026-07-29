-- =============================================================================
-- Synapse - daily reminder preferences
--
-- Where and when the daily study reminder fires is a user preference, so it
-- lives on the profile. The client schedules the local notification from these
-- values (see src/services/notifications); the columns are the source of truth
-- that survives reinstalls.
-- =============================================================================

alter table public.profiles
  add column if not exists reminder_enabled boolean not null default false;

alter table public.profiles
  add column if not exists reminder_hour int not null default 20
    check (reminder_hour between 0 and 23);
