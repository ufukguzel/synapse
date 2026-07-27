import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {brainApi} from '@/api';
import {useAuth} from '@/providers';
import type {RegionCode} from '@/types';

const todayKey = () => new Date().toISOString().slice(0, 10);

export const useRegions = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['regions', user?.id],
    queryFn: () => brainApi.regions(user!.id),
    enabled: !!user?.id,
  });
};

export const useLearningGoals = () =>
  useQuery({queryKey: ['learning-goals'], queryFn: () => brainApi.goals()});

export const useDailyTasks = (date = todayKey()) => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['daily-tasks', user?.id, date],
    queryFn: () => brainApi.tasksForDay(user!.id, date),
    enabled: !!user?.id,
  });
};

export const useStrengthenRegion = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({region, amount}: {region: RegionCode; amount?: number}) =>
      brainApi.strengthen(region, amount),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['regions', user?.id]}),
  });
};

export const useCompleteTask = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => brainApi.completeTask(taskId),
    // Both the task list and the brain map read from this, so refresh both.
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ['daily-tasks', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['regions', user?.id]}),
      ]);
    },
  });
};
