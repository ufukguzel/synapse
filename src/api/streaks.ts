import {supabase} from '@/services/supabase';
import type {DailyActivity, UserStreak} from '@/types';

export const streaksApi = {
  async get(userId: string): Promise<UserStreak | null> {
    const {data, error} = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return data;
  },

  async recentActivity(userId: string, days = 30): Promise<DailyActivity[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const {data, error} = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', since)
      .order('activity_date', {ascending: true});
    if (error) {
      throw error;
    }
    return data ?? [];
  },
};
