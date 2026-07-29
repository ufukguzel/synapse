import {act, create} from 'react-test-renderer';
import {useLessonSession, type LessonSessionState} from '../src/hooks/useLessonSession';
import type {AnyExercise} from '../src/types';

const exercise = (id: string): AnyExercise =>
  ({
    id,
    lessonId: 'lesson-1',
    kind: 'multiple_choice',
    prompt: 'pick one',
    payload: {options: [{id: 'a', label: 'A'}], correctOptionId: 'a'},
    audioUrl: null,
    imageUrl: null,
    orderIndex: 1,
  } as AnyExercise);

/** Renders the hook in a throwaway component and exposes its latest value. */
const renderSession = (exercises: AnyExercise[]) => {
  const handle = {current: null as unknown as LessonSessionState};
  const Probe = () => {
    handle.current = useLessonSession(exercises);
    return null;
  };
  act(() => {
    create(<Probe />);
  });
  return handle;
};

describe('useLessonSession', () => {
  let now = 0;

  beforeEach(() => {
    now = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const advance = (ms: number) => {
    now += ms;
  };

  it('starts on the first exercise with a full heart bar', () => {
    const session = renderSession([exercise('e1'), exercise('e2')]);

    expect(session.current.index).toBe(0);
    expect(session.current.current?.id).toBe('e1');
    expect(session.current.xp).toBe(0);
    expect(session.current.hearts).toBe(5);
    expect(session.current.isFinished).toBe(false);
  });

  it('awards XP for correct answers and takes a heart for wrong ones', () => {
    const session = renderSession([exercise('e1'), exercise('e2')]);

    act(() => session.current.submit({isCorrect: true, userAnswer: 'a'}));
    expect(session.current.xp).toBe(10);
    expect(session.current.hearts).toBe(5);

    act(() => session.current.submit({isCorrect: false, userAnswer: 'b'}));
    expect(session.current.xp).toBe(10);
    expect(session.current.hearts).toBe(4);
    expect(session.current.accuracy).toBe(0.5);
    expect(session.current.isFinished).toBe(true);
  });

  it('fails the session once all hearts are spent', () => {
    const ex = Array.from({length: 6}, (_, i) => exercise(`e${i + 1}`));
    const session = renderSession(ex);

    // Five wrong answers empties the five-heart bar.
    for (let i = 0; i < 5; i++) {
      act(() => session.current.submit({isCorrect: false, userAnswer: 'x'}));
    }
    expect(session.current.hearts).toBe(0);
    expect(session.current.isFailed).toBe(true);
    // Still one exercise left, so failure is not the same as finishing.
    expect(session.current.isFinished).toBe(false);

    act(() => session.current.reset());
    expect(session.current.isFailed).toBe(false);
    expect(session.current.hearts).toBe(5);
  });

  it('times each exercise from when it is shown to when it is answered', () => {
    const session = renderSession([exercise('e1'), exercise('e2')]);

    advance(90_000);
    act(() => session.current.submit({isCorrect: true, userAnswer: 'a'}));
    advance(30_000);
    act(() => session.current.submit({isCorrect: true, userAnswer: 'a'}));

    expect(session.current.results.map(r => r.timeSpentMs)).toEqual([90_000, 30_000]);
    expect(session.current.totalTimeMs).toBe(120_000);
    expect(session.current.minutesStudied).toBe(2);
  });

  it('counts a fast lesson as one minute rather than zero', () => {
    const session = renderSession([exercise('e1')]);

    advance(5_000);
    act(() => session.current.submit({isCorrect: true, userAnswer: 'a'}));

    expect(session.current.totalTimeMs).toBe(5_000);
    expect(session.current.minutesStudied).toBe(1);
  });

  it('reports no study time before anything is answered', () => {
    const session = renderSession([exercise('e1')]);

    expect(session.current.totalTimeMs).toBe(0);
    expect(session.current.minutesStudied).toBe(0);
  });

  it('reset() puts the session back to the start', () => {
    const session = renderSession([exercise('e1'), exercise('e2')]);

    act(() => session.current.submit({isCorrect: false, userAnswer: 'b'}));
    act(() => session.current.reset());

    expect(session.current.index).toBe(0);
    expect(session.current.results).toEqual([]);
    expect(session.current.hearts).toBe(5);
    expect(session.current.totalTimeMs).toBe(0);
  });
});
