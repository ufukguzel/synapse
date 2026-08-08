import {useEffect, useRef} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {brainApi} from '@/api';
import {useAuth} from '@/providers';
import {buildDailyPlan, type PlannerLesson} from '@/utils';
import {useDailyTasks, useRegions} from './useBrain';
import {useCourseOutline} from './useCourseOutline';
import {useCourses} from './useCourses';
import {useDueVocabulary} from './useVocabulary';

const todayKey = () => new Date().toISOString().slice(0, 10);

/**
 * Today's plan, generating it on first open of the day.
 *
 * Generation is deliberately client-side for now: the inputs (weakest region,
 * remaining lessons, words due) are all already loaded for the home screen, and a
 * scheduled server job would need infrastructure this project does not have yet.
 * The write is idempotent per day because it only runs when the day's task list
 * comes back empty, and a ref stops a second attempt while the insert is inflight.
 */
export const useDailyPlan = () => {
  const {user, profile} = useAuth();
  const queryClient = useQueryClient();
  const date = todayKey();

  const tasks = useDailyTasks(date);
  const regions = useRegions();
  const due = useDueVocabulary();
  const courses = useCourses(profile?.current_level);
  const outline = useCourseOutline(courses.data?.[0]?.id);

  const generate = useMutation({
    mutationFn: async () => {
      const plan = buildDailyPlan({
        regions: regions.data ?? [],
        lessons: outline.lessons as PlannerLesson[],
        dueVocabularyCount: due.data?.length ?? 0,
        dailyGoalMinutes: profile?.daily_goal_minutes ?? 10,
      });
      if (!plan.length) {
        return [];
      }
      return brainApi.createTasks(
        plan.map(task => ({...task, user_id: user!.id, task_date: date})),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['daily-tasks', user?.id]}),
  });

  const attempted = useRef<string | null>(null);

  const inputsReady =
    !!user?.id &&
    !tasks.isLoading &&
    !regions.isLoading &&
    !due.isLoading &&
    !outline.isLoading;

  useEffect(() => {
    if (!inputsReady || generate.isPending) {
      return;
    }
    if ((tasks.data ?? []).length > 0) {
      return;
    }
    // One attempt per day per mount cycle; an empty plan means no content, and
    // retrying that on every render would hammer the API for nothing.
    if (attempted.current === date) {
      return;
    }
    attempted.current = date;
    generate.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsReady, tasks.data, date]);

  const list = tasks.data ?? [];
  const completed = list.filter(task => task.status === 'completed');

  return {
    tasks: list,
    completedCount: completed.length,
    totalCount: list.length,
    remainingMinutes: list
      .filter(task => task.status === 'pending')
      .reduce((total, task) => total + task.estimated_minutes, 0),
    isLoading: tasks.isLoading || generate.isPending,
    isGenerating: generate.isPending,
    error: tasks.error ?? generate.error,
  };
};
