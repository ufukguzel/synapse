import type {ReactNode} from 'react';
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {Session, User} from '@supabase/supabase-js';
import {authService} from '@/services/supabase';
import {profilesApi} from '@/api';
import type {Profile} from '@/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      setProfile(await profilesApi.get(userId));
    } catch (error) {
      console.warn('[Synapse] failed to load profile', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    authService
      .getSession()
      .then(async ({data}) => {
        if (!mounted) {
          return;
        }
        setSession(data.session);
        await loadProfile(data.session?.user.id);
      })
      .finally(() => mounted && setIsLoading(false));

    const {data: subscription} = authService.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await loadProfile(nextSession?.user.id);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const {error} = await authService.signInWithEmail(email, password);
    if (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const {error} = await authService.signUpWithEmail(email, password, displayName);
    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const {error} = await authService.signOut();
    if (error) {
      throw error;
    }
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user.id);
  }, [loadProfile, session?.user.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, isLoading, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
