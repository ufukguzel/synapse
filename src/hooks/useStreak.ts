import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {streaksApi} from '@/api';
import {useAuth} from '@/providers';
import {profileQueryKey} from './useProfile';

export const streakQueryKey = (userId: string) => ['streak', userId] as const;
export const dailyActivityQueryKey = (userId: string) => ['daily-activity', userId] as const;
export const userStatsQueryKey = (userId: string) => ['user-stats', userId] as const;

/** Aggregate profile stats (streak, XP, weekly minutes, counts) in one call. */
export const useUserStats = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: userStatsQueryKey(user?.id ?? 'anonymous'),
    queryFn: () => streaksApi.stats(),
    enabled: !!user?.id,
  });
};

export const useStreak = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: streakQueryKey(user?.id ?? 'anonymous'),
    queryFn: () => streaksApi.get(user!.id),
    enabled: !!user?.id,
  });
};

export const useRecentActivity = (days = 30) => {
  const {user} = useAuth();
  return useQuery({
    queryKey: [...dailyActivityQueryKey(user?.id ?? 'anonymous'), days],
    queryFn: () => streaksApi.recentActivity(user!.id, days),
    enabled: !!user?.id,
  });
};

/**
 * Records study time / XP / lessons for today and advances the streak.
 * Call this once per finished lesson or review session.
 */
export const useRecordActivity = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: streaksApi.recordActivity,
    onSuccess: () => {
      const userId = user?.id;
      if (!userId) {
        return;
      }
      queryClient.invalidateQueries({queryKey: streakQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: dailyActivityQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: userStatsQueryKey(userId)});
      queryClient.invalidateQueries({queryKey: profileQueryKey(userId)});
    },
  });
};
