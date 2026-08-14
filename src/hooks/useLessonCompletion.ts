import {useMutation, useQueryClient} from '@tanstack/react-query';
import {brainApi, lessonsApi} from '@/api';
import {useAuth} from '@/providers';
import {REGION_FOR_LESSON_KIND} from '@/utils';
import type {LessonKind} from '@/types';

export interface CompleteLessonInput {
  lessonId: string;
  kind: LessonKind;
  score: number;
  minutes: number;
}

/** Score 0..100 -> region strength delta 1..10, so a perfect run helps ten times more than a bare pass. */
const strengthDelta = (score: number) => Math.max(1, Math.round(score / 10));

/**
 * The one thing missing between the backend and the brain map: nothing called
 * strengthen_region, so a region's strength never changed no matter how many
 * lessons were finished. This hook is complete_lesson (the atomic,
 * server-authoritative RPC) followed by the region bump, then a single place
 * that invalidates every screen the result touches.
 */
export const useCompleteLesson = () => {
  const {user} = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({lessonId, kind, score, minutes}: CompleteLessonInput) => {
      const result = await lessonsApi.completeLesson(lessonId, score, minutes);
      // Repeats still count for the region: redoing a lesson better is real
      // practice, even though it can no longer be farmed for XP or streak days.
      await brainApi.strengthen(REGION_FOR_LESSON_KIND[kind], strengthDelta(score));
      return result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ['lesson-progress', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['lesson-states', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['course-progress', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['user-stats', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['streak', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['daily-activity', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['regions', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['vocab-due', user?.id]}),
        queryClient.invalidateQueries({queryKey: ['daily-tasks', user?.id]}),
      ]);
    },
  });
};
