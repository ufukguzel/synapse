import {useQuery} from '@tanstack/react-query';
import {streaksApi} from '@/api';
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
