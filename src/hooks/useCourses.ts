import {useQuery} from '@tanstack/react-query';
import {coursesApi} from '@/api';
import type {CefrLevel} from '@/types';

export const useCourses = (level?: CefrLevel) =>
  useQuery({queryKey: ['courses', level ?? 'all'], queryFn: () => coursesApi.list(level)});

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

export const useLessonStates = (courseId: string | undefined) =>
  useQuery({
    queryKey: ['lesson-states', courseId],
    queryFn: () => coursesApi.lessonStates(courseId!),
    enabled: !!courseId,
  });
