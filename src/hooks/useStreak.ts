import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {streaksApi, type ActivityInput} from '@/api';
import {useAuth} from '@/providers';

export const useRecentActivity = (days = 30) => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['daily-activity', user?.id, days],
    queryFn: () => streaksApi.recentActivity(user!.id, days),
    enabled: !!user?.id,
  });
};

/**
 * Reports a finished session that did not go through complete_lesson - today
 * that means a vocabulary review, which otherwise never touched the streak or
 * the daily goal at all. Lessons record activity server-side as part of
 * complete_lesson instead of calling this directly.
 */
export const useRecordActivity = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActivityInput) => streaksApi.recordActivity(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ['user-stats', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['daily-activity', user?.id]}),
      ]);
    },
  });
};
