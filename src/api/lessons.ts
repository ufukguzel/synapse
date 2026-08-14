import {supabase} from '@/services/supabase';
import type {AnyExercise, Exercise, Lesson, LessonCompletionResult, LessonState, UserLessonProgress} from '@/types';

const toTypedExercise = (row: Exercise): AnyExercise =>
  ({
    id: row.id,
    lessonId: row.lesson_id,
    kind: row.kind,
    prompt: row.prompt,
    payload: row.payload,
    audioUrl: row.audio_url,
    imageUrl: row.image_url,
    orderIndex: row.order_index,
  } as unknown as AnyExercise);

export const lessonsApi = {
  async get(lessonId: string): Promise<Lesson> {
    const {data, error} = await supabase.from('lessons').select('*').eq('id', lessonId).single();
    if (error) {
      throw error;
    }
    return data;
  },

  async exercises(lessonId: string): Promise<AnyExercise[]> {
    const {data, error} = await supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index', {ascending: true});
    if (error) {
      throw error;
    }
    return (data ?? []).map(toTypedExercise);
  },

  async progressForUser(userId: string): Promise<UserLessonProgress[]> {
    const {data, error} = await supabase.from('user_lesson_progress').select('*').eq('user_id', userId);
    if (error) {
      throw error;
    }
    return data ?? [];
  },

  /**
   * One atomic, server-authoritative call replacing what used to be three
   * separate round trips (upsert progress + record_activity + enroll_vocabulary).
   * XP comes from lessons.xp_reward, not the client, and a repeat cannot be
   * farmed for XP - see the complete_lesson migration for the full contract.
   */
  async completeLesson(
    lessonId: string,
    score: number,
    minutes: number,
  ): Promise<LessonCompletionResult> {
    const {data, error} = await supabase.rpc('complete_lesson', {
      p_lesson_id: lessonId,
      p_score: score,
      p_minutes: minutes,
    });
    if (error) {
      throw error;
    }
    return data;
  },

  /** Real lock/available/completed status per lesson, sequenced across the whole course. */
  async states(courseId: string): Promise<LessonState[]> {
    const {data, error} = await supabase.rpc('lesson_states', {p_course_id: courseId});
    if (error) {
      throw error;
    }
    return data ?? [];
  },
};
