/**
 * SM-2 spaced repetition scheduling.
 * quality: 0 = total blackout ... 5 = perfect recall
 */
export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface SrsResult extends SrsState {
  dueAt: string;
}

export const INITIAL_SRS_STATE: SrsState = {easeFactor: 2.5, intervalDays: 0, repetitions: 0};

export const scheduleNextReview = (state: SrsState, quality: number, now = new Date()): SrsResult => {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let {easeFactor, intervalDays, repetitions} = state;

  if (q < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  }

  easeFactor = Math.max(1.3, Number(easeFactor.toFixed(3)));
  intervalDays = Math.max(1, intervalDays);

  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString();
  return {easeFactor, intervalDays, repetitions, dueAt};
};
