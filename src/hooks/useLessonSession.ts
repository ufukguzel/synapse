import {useCallback, useMemo, useState} from 'react';
import {HEARTS_PER_SESSION, XP_PER_CORRECT_ANSWER} from '@/constants';
import type {AnyExercise, ExerciseResult} from '@/types';

export interface LessonSessionState {
  exercises: AnyExercise[];
  index: number;
  current: AnyExercise | undefined;
  results: ExerciseResult[];
  hearts: number;
  xp: number;
  progress: number;
  isFinished: boolean;
  isFailed: boolean;
  accuracy: number;
  submit: (result: Omit<ExerciseResult, 'exerciseId'>) => void;
  reset: () => void;
}

export const useLessonSession = (exercises: AnyExercise[]): LessonSessionState => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [hearts, setHearts] = useState(HEARTS_PER_SESSION);

  const current = exercises[index];

  const submit = useCallback(
    (result: Omit<ExerciseResult, 'exerciseId'>) => {
      const exercise = exercises[index];
      if (!exercise) {
        return;
      }
      setResults(prev => [...prev, {...result, exerciseId: exercise.id}]);
      if (!result.isCorrect) {
        setHearts(prev => Math.max(0, prev - 1));
      }
      setIndex(prev => prev + 1);
    },
    [exercises, index],
  );

  const reset = useCallback(() => {
    setIndex(0);
    setResults([]);
    setHearts(HEARTS_PER_SESSION);
  }, []);

  const correctCount = results.filter(r => r.isCorrect).length;

  return useMemo(
    () => ({
      exercises,
      index,
      current,
      results,
      hearts,
      xp: correctCount * XP_PER_CORRECT_ANSWER,
      progress: exercises.length ? Math.min(1, index / exercises.length) : 0,
      isFinished: exercises.length > 0 && index >= exercises.length,
      isFailed: hearts === 0,
      accuracy: results.length ? correctCount / results.length : 0,
      submit,
      reset,
    }),
    [exercises, index, current, results, hearts, correctCount, submit, reset],
  );
};
