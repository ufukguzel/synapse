import {supabase} from '@/services/supabase';
import type {UserVocabulary, VocabularyItem} from '@/types';

/** A user_vocabulary row with its word joined in. */
export interface UserVocabularyWithItem extends UserVocabulary {
  vocabulary_items: VocabularyItem | null;
}

/** @deprecated name kept for callers; use UserVocabularyWithItem. */
export type DueReviewItem = UserVocabularyWithItem;

export const vocabularyApi = {
  async due(userId: string, limit = 20): Promise<UserVocabularyWithItem[]> {
    const {data, error} = await supabase
      .from('user_vocabulary')
      .select('*, vocabulary_items(*)')
      .eq('user_id', userId)
      .lte('due_at', new Date().toISOString())
      .order('due_at', {ascending: true})
      .limit(limit);
    if (error) {
      throw error;
    }
    return (data ?? []) as unknown as UserVocabularyWithItem[];
  },

  async favorites(userId: string): Promise<UserVocabularyWithItem[]> {
    const {data, error} = await supabase
      .from('user_vocabulary')
      .select('*, vocabulary_items(*)')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('last_reviewed_at', {ascending: false, nullsFirst: false});
    if (error) {
      throw error;
    }
    return (data ?? []) as unknown as UserVocabularyWithItem[];
  },

  async saveReview(params: {
    id: string;
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    dueAt: string;
  }) {
    const {error} = await supabase
      .from('user_vocabulary')
      .update({
        ease_factor: params.easeFactor,
        interval_days: params.intervalDays,
        repetitions: params.repetitions,
        due_at: params.dueAt,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', params.id);
    if (error) {
      throw error;
    }
  },

  async toggleFavorite(id: string, isFavorite: boolean) {
    const {error} = await supabase.from('user_vocabulary').update({is_favorite: isFavorite}).eq('id', id);
    if (error) {
      throw error;
    }
  },
};
