import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {HEARTS_PER_SESSION, XP_PER_CORRECT_ANSWER} from '@/constants';
import type {AnyExercise, ExerciseResult} from '@/types';

/** What a caller hands to `submit`; the hook stamps the id and the timing itself. */
export type ExerciseAnswer = Pick<ExerciseResult, 'isCorrect' | 'userAnswer'>;

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
  /** Time spent answering, summed over the exercises answered so far. */
  totalTimeMs: number;
  /** `totalTimeMs` as whole minutes, floored at 1 once anything was answered. */
  minutesStudied: number;
  submit: (answer: ExerciseAnswer) => void;
  reset: () => void;
}

export const useLessonSession = (exercises: AnyExercise[]): LessonSessionState => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [hearts, setHearts] = useState(HEARTS_PER_SESSION);

  const current = exercises[index];

  // Each exercise's window starts when it is rendered and ends when it is
  // answered, so the windows tile the session — summing them gives the total.
  const questionStartRef = useRef(Date.now());
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [index]);

  const submit = useCallback(
    (answer: ExerciseAnswer) => {
      const exercise = exercises[index];
      if (!exercise) {
        return;
      }
      const timeSpentMs = Math.max(0, Date.now() - questionStartRef.current);
      setResults(prev => [...prev, {...answer, exerciseId: exercise.id, timeSpentMs}]);
      if (!answer.isCorrect) {
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
    questionStartRef.current = Date.now();
  }, []);

  const correctCount = results.filter(r => r.isCorrect).length;
  const totalTimeMs = results.reduce((sum, r) => sum + r.timeSpentMs, 0);

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
      totalTimeMs,
      // A finished lesson that rounds to 0 would never move a minutes-based
      // daily goal, so anything answered counts as at least one minute.
      minutesStudied: totalTimeMs > 0 ? Math.max(1, Math.round(totalTimeMs / 60_000)) : 0,
      submit,
      reset,
    }),
    [exercises, index, current, results, hearts, correctCount, totalTimeMs, submit, reset],
  );
};
