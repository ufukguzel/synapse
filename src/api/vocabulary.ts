import {supabase} from '@/services/supabase';
import type {UserVocabulary, VocabularyItem} from '@/types';

export interface DueReviewItem extends UserVocabulary {
  vocabulary_items: VocabularyItem | null;
}

export const vocabularyApi = {
  async due(userId: string, limit = 20): Promise<DueReviewItem[]> {
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
    return (data ?? []) as unknown as DueReviewItem[];
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
