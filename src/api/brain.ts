import {supabase} from '@/services/supabase';
import type {
  DailyTask,
  LearningGoal,
  RegionCode,
  SkillRegion,
  UserRegionStrength,
} from '@/types';

export interface RegionWithStrength extends SkillRegion {
  strength: number;
}

export const brainApi = {
  /** Reference regions joined with this user's strength, in display order. */
  async regions(userId: string): Promise<RegionWithStrength[]> {
    const [{data: regions, error: regionError}, {data: strengths, error: strengthError}] =
      await Promise.all([
        supabase.from('skill_regions').select('*').order('order_index', {ascending: true}),
        supabase.from('user_region_strength').select('*').eq('user_id', userId),
      ]);
    if (regionError) {
      throw regionError;
    }
    if (strengthError) {
      throw strengthError;
    }

    const byCode = new Map((strengths ?? []).map(row => [row.region_code, row.strength]));
    return (regions ?? []).map(region => ({
      ...region,
      strength: byCode.get(region.code) ?? 0,
    }));
  },

  async goals(): Promise<LearningGoal[]> {
    const {data, error} = await supabase
      .from('learning_goals')
      .select('*')
      .order('order_index', {ascending: true});
    if (error) {
      throw error;
    }
    return data ?? [];
  },

  /** Strength is capped server-side; the delta may be negative to decay. */
  async strengthen(regionCode: RegionCode, amount = 1): Promise<UserRegionStrength> {
    const {data, error} = await supabase.rpc('strengthen_region', {
      p_region_code: regionCode,
      p_amount: amount,
    });
    if (error) {
      throw error;
    }
    return data;
  },

  async tasksForDay(userId: string, date: string): Promise<DailyTask[]> {
    const {data, error} = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_date', date)
      .order('order_index', {ascending: true});
    if (error) {
      throw error;
    }
    return data ?? [];
  },

  async completeTask(taskId: string): Promise<DailyTask> {
    const {data, error} = await supabase
      .from('daily_tasks')
      .update({status: 'completed', completed_at: new Date().toISOString()})
      .eq('id', taskId)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data;
  },

  async createTasks(tasks: Partial<DailyTask>[]): Promise<DailyTask[]> {
    const {data, error} = await supabase.from('daily_tasks').insert(tasks).select('*');
    if (error) {
      throw error;
    }
    return data ?? [];
  },
};
