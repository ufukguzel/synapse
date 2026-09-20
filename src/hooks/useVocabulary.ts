import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {vocabularyApi, type DueReviewItem} from '@/api';
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

/** Every word the user has starred, for the favorites-only review. */
export const useFavoriteVocabulary = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['vocab-favorites', user?.id],
    queryFn: () => vocabularyApi.favorites(user!.id),
    enabled: !!user?.id,
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

/**
 * Star/unstar a word. Optimistic so the star flips instantly during a review:
 * the due-list cache is patched in place (it's what the review card renders) and
 * rolled back on error. The favorites list is refetched on settle so unstarred
 * words leave it.
 */
export const useToggleFavorite = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const dueKey = ['vocab-due', user?.id];
  const favKey = ['vocab-favorites', user?.id];

  const patch = (key: unknown[], id: string, isFavorite: boolean) =>
    queryClient.setQueryData<DueReviewItem[]>(key, current =>
      current?.map(item => (item.id === id ? {...item, is_favorite: isFavorite} : item)),
    );

  return useMutation({
    mutationFn: (vars: {id: string; isFavorite: boolean}) =>
      vocabularyApi.toggleFavorite(vars.id, vars.isFavorite),
    onMutate: async vars => {
      await Promise.all([
        queryClient.cancelQueries({queryKey: dueKey}),
        queryClient.cancelQueries({queryKey: favKey}),
      ]);
      const previousDue = queryClient.getQueryData<DueReviewItem[]>(dueKey);
      const previousFav = queryClient.getQueryData<DueReviewItem[]>(favKey);
      patch(dueKey, vars.id, vars.isFavorite);
      patch(favKey, vars.id, vars.isFavorite);
      return {previousDue, previousFav};
    },
    onError: (_error, _vars, context) => {
      if (context?.previousDue) {
        queryClient.setQueryData(dueKey, context.previousDue);
      }
      if (context?.previousFav) {
        queryClient.setQueryData(favKey, context.previousFav);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: favKey});
    },
  });
};
