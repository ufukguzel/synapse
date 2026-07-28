import {useMutation, useQueryClient} from '@tanstack/react-query';
import {lessonsApi} from '@/api';
import {useAuth} from '@/providers';
import {profileQueryKey} from './useProfile';
import {dailyActivityQueryKey, streakQueryKey, userStatsQueryKey} from './useStreak';

/**
 * Completes a lesson through the `complete_lesson` RPC and refreshes everything
 * the result touches: the streak, today's activity, the profile (total XP) and
 * the vocabulary review queue (the lesson may have enrolled new words).
 */
export const useCompleteLesson = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lessonsApi.complete,
    onSuccess: () => {
      const userId = user?.id;
      if (!userId) {
        return;
      }
      queryClient.invalidateQueries({queryKey: streakQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: dailyActivityQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: userStatsQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: profileQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: ['vocab-due', userId]});
      // Completing a lesson can unlock the next one, in any course.
      queryClient.invalidateQueries({queryKey: ['lesson-states']});
    },
  });
};
