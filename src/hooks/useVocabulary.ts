import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {vocabularyApi} from '@/api';
import {useAuth} from '@/providers';
import type {CefrLevel} from '@/types';

export const useDueVocabulary = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['vocab-due', user?.id],
    queryFn: () => vocabularyApi.due(user!.id),
    enabled: !!user?.id,
  });
};

export const useAvailableVocabulary = (level: CefrLevel | undefined, limit = 10) => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['vocab-available', user?.id, level, limit],
    queryFn: () => vocabularyApi.availableToLearn(user!.id, level!, limit),
    enabled: !!user?.id && !!level,
  });
};

/**
 * Adds words to the review queue. Nothing called enroll_vocabulary before, so
 * `user_vocabulary` stayed empty and the review screen was permanently
 * "All caught up" - the SRS scheduler had no rows to work on.
 */
export const useEnrollVocabulary = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vocabularyIds: string[]) => vocabularyApi.enrollMany(vocabularyIds),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ['vocab-due', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['vocab-available', user?.id]}),
      ]);
    },
  });
};
