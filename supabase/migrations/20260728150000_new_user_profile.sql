-- =============================================================================
-- Synapse - richer new-user profile
--
-- `handle_new_user` seeded only display_name and avatar_url. Sign-up can also
-- carry the learner's native language and timezone in the auth metadata (e.g.
-- picked on a pre-auth welcome screen); when present, use them so onboarding
-- starts pre-filled instead of on the Turkish/Istanbul defaults.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, native_language, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    -- Fall back to the column defaults when the metadata is absent or blank.
    coalesce(nullif(new.raw_user_meta_data ->> 'native_language', ''), 'tr'),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'Europe/Istanbul')
  )
  on conflict (id) do nothing;

  insert into public.user_streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
