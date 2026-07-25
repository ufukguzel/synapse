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

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[Synapse] SUPABASE_URL / SUPABASE_ANON_KEY are missing. Copy .env.example to .env ' +
      'and fill them in, then restart Metro with `npm run start:reset`.',
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
