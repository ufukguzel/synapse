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

  /**
   * Writes today's activity and advances the streak in one transaction.
   * The RPC derives the user from `auth.uid()`, so there is no userId to pass.
   */
  async recordActivity(params: {
    minutes?: number;
    xp?: number;
    lessons?: number;
  }): Promise<UserStreak> {
    const {data, error} = await supabase.rpc('record_activity', {
      p_minutes: params.minutes ?? 0,
      p_xp: params.xp ?? 0,
      p_lessons: params.lessons ?? 0,
    });
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
