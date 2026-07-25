import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_ANON_KEY, SUPABASE_URL} from '@env';
import type {Database} from '@/types';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly in dev: a missing .env is the most common setup mistake.
  console.warn(
    '[Synapse] SUPABASE_URL / SUPABASE_ANON_KEY are missing. Copy .env.example to .env and fill them in.',
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Required on React Native: there is no URL to parse a session from.
    detectSessionInUrl: false,
  },
});
