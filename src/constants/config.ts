export const APP_NAME = 'Synapse';

export const QUERY_STALE_TIME_MS = 1000 * 60 * 2;
// Kept for a day so the persisted cache can hydrate screens offline.
export const QUERY_GC_TIME_MS = 1000 * 60 * 60 * 24;
export const QUERY_PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24;

export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20, 30] as const;

export const XP_PER_CORRECT_ANSWER = 10;
export const XP_PER_VOCABULARY_REVIEW = 5;
export const HEARTS_PER_SESSION = 5;

export const STORAGE_KEYS = {
  authSession: 'synapse.auth.session',
  onboardingSeen: 'synapse.onboarding.seen',
  themeScheme: 'synapse.theme.scheme',
  queryCache: 'synapse.query-cache',
} as const;
