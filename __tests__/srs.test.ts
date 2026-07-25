import {INITIAL_SRS_STATE, scheduleNextReview} from '../src/utils/srs';

describe('scheduleNextReview (SM-2)', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('resets the interval when recall fails', () => {
    const result = scheduleNextReview({easeFactor: 2.5, intervalDays: 10, repetitions: 4}, 1, now);
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
  });

  it('uses 1 then 6 days for the first two successful reviews', () => {
    const first = scheduleNextReview(INITIAL_SRS_STATE, 4, now);
    expect(first.intervalDays).toBe(1);

    const second = scheduleNextReview(first, 4, now);
    expect(second.intervalDays).toBe(6);
  });

  it('multiplies by the ease factor from the third review on', () => {
    const third = scheduleNextReview({easeFactor: 2.5, intervalDays: 6, repetitions: 2}, 4, now);
    expect(third.intervalDays).toBe(15);
  });

  it('never drops the ease factor below 1.3', () => {
    let state = {easeFactor: 1.35, intervalDays: 6, repetitions: 3};
    for (let i = 0; i < 5; i++) {
      state = scheduleNextReview(state, 3, now);
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
