import {useQueries, useQuery} from '@tanstack/react-query';
import {coursesApi, lessonsApi} from '@/api';
import {useAuth} from '@/providers';
import type {Lesson} from '@/types';

export const useLessonProgress = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['lesson-progress', user?.id],
    queryFn: () => lessonsApi.progressForUser(user!.id),
    enabled: !!user?.id,
  });
};

export interface OutlineLesson extends Lesson {
  unitTitle: string;
  isCompleted: boolean;
}

/**
 * Flattens a course into an ordered lesson list annotated with progress, which is
 * what the neural path needs: units give the order, progress decides which nodes
 * have fired.
 */
export const useCourseOutline = (courseId: string | undefined) => {
  const units = useQuery({
    queryKey: ['units', courseId],
    queryFn: () => coursesApi.units(courseId!),
    enabled: !!courseId,
  });

  const unitList = units.data ?? [];

  const lessonQueries = useQueries({
    queries: unitList.map(unit => ({
      queryKey: ['lessons', unit.id],
      queryFn: () => coursesApi.lessons(unit.id),
      enabled: !!unit.id,
    })),
  });

  const progress = useLessonProgress();
  const completedIds = new Set(
    (progress.data ?? []).filter(row => row.status === 'completed').map(row => row.lesson_id),
  );

  const lessons: OutlineLesson[] = unitList.flatMap((unit, index) =>
    (lessonQueries[index]?.data ?? []).map(lesson => ({
      ...lesson,
      unitTitle: unit.title,
      isCompleted: completedIds.has(lesson.id),
    })),
  );

  return {
    lessons,
    isLoading: units.isLoading || lessonQueries.some(query => query.isLoading) || progress.isLoading,
    isError: units.isError,
    error: units.error,
  };
};
