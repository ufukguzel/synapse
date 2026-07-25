import {supabase} from '@/services/supabase';
import type {CefrLevel, Course, Lesson, Unit} from '@/types';

export const coursesApi = {
  async list(level?: CefrLevel): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index', {ascending: true});
    if (level) {
      query = query.eq('level', level);
    }
    const {data, error} = await query;
    if (error) {
      throw error;
    }
    return data ?? [];
  },

  async units(courseId: string): Promise<Unit[]> {
    const {data, error} = await supabase
      .from('units')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', {ascending: true});
    if (error) {
      throw error;
    }
    return data ?? [];
  },

  async lessons(unitId: string): Promise<Lesson[]> {
    const {data, error} = await supabase
      .from('lessons')
      .select('*')
      .eq('unit_id', unitId)
      .eq('is_published', true)
      .order('order_index', {ascending: true});
    if (error) {
      throw error;
    }
    return data ?? [];
  },
};
