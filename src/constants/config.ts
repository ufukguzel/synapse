export const APP_NAME = 'Synapse';

export const QUERY_STALE_TIME_MS = 1000 * 60 * 2;
export const QUERY_GC_TIME_MS = 1000 * 60 * 30;

export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20, 30] as const;

export const XP_PER_CORRECT_ANSWER = 10;
export const HEARTS_PER_SESSION = 5;

export const STORAGE_KEYS = {
  authSession: 'synapse.auth.session',
  onboardingSeen: 'synapse.onboarding.seen',
  themeScheme: 'synapse.theme.scheme',
  // Cached so the interface opens in the right language before the profile loads.
  uiLanguage: 'synapse.ui.language',
} as const;
