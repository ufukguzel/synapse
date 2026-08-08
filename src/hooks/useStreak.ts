import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {streaksApi, type ActivityInput} from '@/api';
import {useAuth} from '@/providers';

export const useStreak = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['streak', user?.id],
    queryFn: () => streaksApi.get(user!.id),
    enabled: !!user?.id,
  });
};

export const useRecentActivity = (days = 30) => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['daily-activity', user?.id, days],
    queryFn: () => streaksApi.recentActivity(user!.id, days),
    enabled: !!user?.id,
  });
};

/**
 * Reports a finished session. Both the streak and the daily-activity queries are
 * invalidated, otherwise the home screen keeps showing the pre-session numbers
 * until the app is restarted.
 */
export const useRecordActivity = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActivityInput) => streaksApi.recordActivity(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ['streak', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['daily-activity', user?.id]}),
      ]);
    },
  });
};
