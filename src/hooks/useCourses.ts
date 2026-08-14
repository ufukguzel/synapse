import {useQuery} from '@tanstack/react-query';
import {coursesApi} from '@/api';
import {useAuth} from '@/providers';
import type {CefrLevel} from '@/types';

export const useCourses = (level?: CefrLevel) =>
  useQuery({queryKey: ['courses', level ?? 'all'], queryFn: () => coursesApi.list(level)});

/** Completion count per course for the current user. */
export const useCourseProgress = () => {
  const {user} = useAuth();
  return useQuery({
    queryKey: ['course-progress', user?.id],
    queryFn: () => coursesApi.progress(),
    enabled: !!user?.id,
  });
};

export const useUnits = (courseId: string | undefined) =>
  useQuery({
    queryKey: ['units', courseId],
    queryFn: () => coursesApi.units(courseId!),
    enabled: !!courseId,
  });

export const useLessons = (unitId: string | undefined) =>
  useQuery({
    queryKey: ['lessons', unitId],
    queryFn: () => coursesApi.lessons(unitId!),
    enabled: !!unitId,
  });
