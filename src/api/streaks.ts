import {supabase} from '@/services/supabase';
import type {DailyActivity, UserStreak} from '@/types';

export interface ActivityInput {
  minutes?: number;
  xp?: number;
  lessons?: number;
}

export const streaksApi = {
  /**
   * Records a finished session and advances the streak. The database function
   * owns the streak arithmetic (and derives the user from auth.uid()), so the
   * client only reports what happened.
   */
  async recordActivity({minutes = 0, xp = 0, lessons = 0}: ActivityInput): Promise<UserStreak> {
    const {data, error} = await supabase.rpc('record_activity', {
      p_minutes: minutes,
      p_xp: xp,
      p_lessons: lessons,
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
