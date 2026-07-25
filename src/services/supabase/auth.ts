import {supabase} from './client';

export const authService = {
  getSession: () => supabase.auth.getSession(),

  signUpWithEmail: (email: string, password: string, displayName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: displayName ? {data: {display_name: displayName}} : undefined,
    }),

  signInWithEmail: (email: string, password: string) =>
    supabase.auth.signInWithPassword({email, password}),

  signInWithOtp: (email: string) =>
    supabase.auth.signInWithOtp({email, options: {shouldCreateUser: true}}),

  verifyOtp: (email: string, token: string) =>
    supabase.auth.verifyOtp({email, token, type: 'email'}),

  resetPassword: (email: string) => supabase.auth.resetPasswordForEmail(email),

  updatePassword: (password: string) => supabase.auth.updateUser({password}),

  signOut: () => supabase.auth.signOut(),

  onAuthStateChange: (cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(cb),
};
