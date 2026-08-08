import {supabase} from '@/services/supabase';
import type {CefrLevel, UserVocabulary, VocabularyItem} from '@/types';

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

  /**
   * Vocabulary the user has not started yet. `vocabulary_items` has no link to
   * lessons (only `level` and `tags`), so "new words" is scoped by level and
   * filtered against what is already enrolled.
   */
  async availableToLearn(userId: string, level: CefrLevel, limit = 10): Promise<VocabularyItem[]> {
    const [{data: enrolled, error: enrolledError}, {data: items, error: itemsError}] =
      await Promise.all([
        supabase.from('user_vocabulary').select('vocabulary_id').eq('user_id', userId),
        supabase.from('vocabulary_items').select('*').eq('level', level),
      ]);
    if (enrolledError) {
      throw enrolledError;
    }
    if (itemsError) {
      throw itemsError;
    }

    const taken = new Set((enrolled ?? []).map(row => row.vocabulary_id));
    return (items ?? []).filter(item => !taken.has(item.id)).slice(0, limit);
  },

  /** Enrols one word into the user's review queue, due immediately. */
  async enroll(vocabularyId: string) {
    const {error} = await supabase.rpc('enroll_vocabulary', {p_vocabulary_id: vocabularyId});
    if (error) {
      throw error;
    }
  },

  async enrollMany(vocabularyIds: string[]) {
    for (const id of vocabularyIds) {
      await vocabularyApi.enroll(id);
    }
    return vocabularyIds.length;
  },

  async toggleFavorite(id: string, isFavorite: boolean) {
    const {error} = await supabase.from('user_vocabulary').update({is_favorite: isFavorite}).eq('id', id);
    if (error) {
      throw error;
    }
  },
};
