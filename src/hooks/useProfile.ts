import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {profilesApi} from '@/api';
import {useAuth} from '@/providers';
import type {Profile} from '@/types';

export const profileQueryKey = (userId: string) => ['profile', userId] as const;

export const useProfile = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: profileQueryKey(user?.id ?? 'anonymous'),
    queryFn: () => profilesApi.get(user!.id),
    enabled: !!user?.id,
  });
};

/** Aggregate stats (streak, XP, minutes, words) in one round trip. */
export const useUserStats = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => profilesApi.stats(),
    enabled: !!user?.id,
  });
};

export const useUpdateProfile = () => {
  const {user, refreshProfile} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<Profile>) => profilesApi.update(user!.id, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: profileQueryKey(user!.id)});
      await refreshProfile();
    },
  });
};
