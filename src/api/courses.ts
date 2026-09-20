import {supabase} from '@/services/supabase';
import type {CefrLevel, Course, CourseProgress, Lesson, LessonState, Unit} from '@/types';

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

  /** Per-lesson gating for a course (locked / available / in_progress / completed). */
  async lessonStates(courseId: string): Promise<LessonState[]> {
    const {data, error} = await supabase.rpc('lesson_states', {p_course_id: courseId});
    if (error) {
      throw error;
    }
    return data ?? [];
  },

  /** Completed vs total lessons per course for the current user. */
  async progress(): Promise<CourseProgress[]> {
    const {data, error} = await supabase.rpc('course_progress');
    if (error) {
      throw error;
    }
    return data ?? [];
  },
};
