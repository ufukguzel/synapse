import {renderHook, act} from '@testing-library/react-native';
import {useLessonSession} from '@/hooks/useLessonSession';
import {HEARTS_PER_SESSION} from '@/constants';
import type {AnyExercise} from '@/types';

const exercise = (id: string): AnyExercise =>
  ({id, lessonId: 'l1', kind: 'multiple_choice', prompt: id, payload: {}, orderIndex: 0} as
    unknown as AnyExercise);

const wrong = {isCorrect: false, userAnswer: 'x', timeSpentMs: 0};
const right = {isCorrect: true, userAnswer: 'y', timeSpentMs: 0};

describe('useLessonSession', () => {
  it('advances and accumulates XP for correct answers', () => {
    const {result} = renderHook(() => useLessonSession([exercise('a'), exercise('b')]));

    act(() => result.current.submit(right));
    expect(result.current.index).toBe(1);
    expect(result.current.xp).toBeGreaterThan(0);
    expect(result.current.isFinished).toBe(false);

    act(() => result.current.submit(right));
    expect(result.current.isFinished).toBe(true);
    expect(result.current.accuracy).toBe(1);
  });

  /**
   * Regression: hearts used to be decoration. isFailed was computed but nothing
   * consumed it, so a learner could miss every question and still complete the
   * lesson.
   */
  it('reports failure once hearts run out', () => {
    const exercises = Array.from({length: HEARTS_PER_SESSION + 2}, (_, i) =>
      exercise(`e${i}`),
    );
    const {result} = renderHook(() => useLessonSession(exercises));

    for (let i = 0; i < HEARTS_PER_SESSION; i++) {
      expect(result.current.isFailed).toBe(false);
      act(() => result.current.submit(wrong));
    }

    expect(result.current.hearts).toBe(0);
    expect(result.current.isFailed).toBe(true);
  });

  it('reset returns the session to its initial state', () => {
    const {result} = renderHook(() => useLessonSession([exercise('a'), exercise('b')]));
    act(() => result.current.submit(wrong));
    act(() => result.current.reset());

    expect(result.current.index).toBe(0);
    expect(result.current.results).toHaveLength(0);
    expect(result.current.hearts).toBe(HEARTS_PER_SESSION);
  });

  it('ignores submissions past the end instead of throwing', () => {
    const {result} = renderHook(() => useLessonSession([exercise('a')]));
    act(() => result.current.submit(right));
    act(() => result.current.submit(right));
    expect(result.current.results).toHaveLength(1);
  });

  it('an empty lesson is never finished', () => {
    const {result} = renderHook(() => useLessonSession([]));
    expect(result.current.isFinished).toBe(false);
    expect(result.current.progress).toBe(0);
  });
});
