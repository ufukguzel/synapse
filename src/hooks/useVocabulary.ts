import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {vocabularyApi} from '@/api';
import {useAuth} from '@/providers';

export const dueReviewsQueryKey = (userId: string) => ['vocab-due', userId] as const;
export const favoritesQueryKey = (userId: string) => ['vocab-favorites', userId] as const;

/** Words the user has starred. */
export const useFavorites = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: favoritesQueryKey(user?.id ?? 'anonymous'),
    queryFn: () => vocabularyApi.favorites(user!.id),
    enabled: !!user?.id,
  });
};

/**
 * Toggles the favorite flag on a user_vocabulary row and refreshes both the
 * favorites list and the review queue (which shows the same star).
 */
export const useToggleFavorite = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {id: string; isFavorite: boolean}) =>
      vocabularyApi.toggleFavorite(params.id, params.isFavorite),
    onSuccess: () => {
      const userId = user?.id;
      if (!userId) {
        return;
      }
      queryClient.invalidateQueries({queryKey: favoritesQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: dueReviewsQueryKey(userId)});
      // The profile's favorite count comes from user_stats.
      queryClient.invalidateQueries({queryKey: ['user-stats', userId]});
    },
  });
};
