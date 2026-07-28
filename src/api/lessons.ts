import {supabase} from '@/services/supabase';
import type {
  AnyExercise,
  CompleteLessonResult,
  Exercise,
  Lesson,
  UserLessonProgress,
} from '@/types';

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
   * Marks a lesson complete, awards its XP, advances the streak and enrols the
   * lesson's vocabulary — all in one atomic RPC. XP is derived server-side from
   * `lessons.xp_reward`, and is only granted the first time the lesson is
   * finished (repeats keep the streak alive but cannot be farmed).
   */
  async complete(params: {
    lessonId: string;
    score: number;
    minutes: number;
  }): Promise<CompleteLessonResult> {
    const {data, error} = await supabase.rpc('complete_lesson', {
      p_lesson_id: params.lessonId,
      p_score: params.score,
      p_minutes: params.minutes,
    });
    if (error) {
      throw error;
    }
    return data;
  },
};
