import {supabase} from '@/services/supabase';
import type {Profile} from '@/types';

export const profilesApi = {
  async get(userId: string): Promise<Profile | null> {
    const {data, error} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data;
  },

  async update(userId: string, patch: Partial<Profile>): Promise<Profile> {
    const {data, error} = await supabase
      .from('profiles')
      .update({...patch, updated_at: new Date().toISOString()})
      .eq('id', userId)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data;
  },

  async completeOnboarding(userId: string, patch: Partial<Profile>): Promise<Profile> {
    return profilesApi.update(userId, {...patch, onboarding_completed: true});
  },
};
