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
   * Atomic completion via the `complete_lesson` RPC: marks progress, awards XP
   * server-side (from `xp_reward`, first completion only), advances the streak
   * and auto-enrols the lesson's vocabulary — one call, no farming.
   */
  async completeLesson(params: {
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

  async complete(params: {userId: string; lessonId: string; score: number}) {
    const {data, error} = await supabase
      .from('user_lesson_progress')
      .upsert(
        {
          user_id: params.userId,
          lesson_id: params.lessonId,
          status: 'completed',
          score: params.score,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {onConflict: 'user_id,lesson_id'},
      )
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data;
  },
};
