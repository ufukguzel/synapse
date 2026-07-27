import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_ANON_KEY, SUPABASE_URL} from '@env';
import type {Database} from '@/types';

/**
 * Placeholders keep the app bootable on a fresh clone with no .env, so you can
 * open it in a simulator before a Supabase project exists. Any network call will
 * fail until real credentials are in place.
 */
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder-anon-key';

/**
 * A copied-but-unedited .env is the common case, not the missing-file case: the
 * values are then present-but-fake, so a truthiness check reports the app as
 * configured and the warning below never fires. Every request instead fails with
 * an opaque network error, which is a much worse first-run experience.
 */
const isPlaceholder = (value: string | undefined): boolean => {
  if (!value) {
    return true;
  }
  const trimmed = value.trim();
  return (
    trimmed === '' ||
    trimmed.includes('xxxx') ||
    trimmed.includes('placeholder') ||
    // `.env.example` truncates the sample JWT with a literal "....".
    trimmed.includes('....')
  );
};

export const isSupabaseConfigured =
  !isPlaceholder(SUPABASE_URL) && !isPlaceholder(SUPABASE_ANON_KEY);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[Synapse] SUPABASE_URL / SUPABASE_ANON_KEY are missing or still the .env.example ' +
      'placeholders. Fill them in with real project credentials, then restart Metro with ' +
      '`npm run start:reset`. Until then every request will fail with a network error.',
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL || FALLBACK_URL,
  SUPABASE_ANON_KEY || FALLBACK_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Required on React Native: there is no URL to parse a session from.
      detectSessionInUrl: false,
    },
  },
);
