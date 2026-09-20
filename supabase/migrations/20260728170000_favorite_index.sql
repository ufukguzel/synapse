-- =============================================================================
-- Synapse - favorites index
--
-- The favorites screen queries user_vocabulary by (user_id, is_favorite).
-- A partial index keeps that lookup cheap and small — it only covers starred
-- rows, which are a fraction of a user's vocabulary.
-- =============================================================================

create index if not exists user_vocab_favorite_idx
  on public.user_vocabulary (user_id)
  where is_favorite;
