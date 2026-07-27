import type {DailyTask, LessonKind, RegionCode} from '@/types';

/**
 * Which brain region a lesson trains. Grammar strengthens production, so it is
 * filed under writing rather than given a region of its own - the five regions
 * are fixed by the design.
 */
export const REGION_FOR_LESSON_KIND: Record<LessonKind, RegionCode> = {
  vocabulary: 'memory',
  grammar: 'writing',
  listening: 'listening',
  reading: 'reading',
  speaking: 'speaking',
  writing: 'writing',
};

export interface PlannerLesson {
  id: string;
  title: string;
  kind: LessonKind;
  estimated_minutes: number;
  isCompleted: boolean;
}

export interface PlannerRegion {
  code: RegionCode;
  /** 0..100 */
  strength: number;
}

export interface PlannerInput {
  regions: PlannerRegion[];
  lessons: PlannerLesson[];
  /** Words already due for review. */
  dueVocabularyCount: number;
  dailyGoalMinutes: number;
}

/** A task ready to be inserted; the caller adds user_id and task_date. */
export type TaskDraft = Pick<
  DailyTask,
  'region_code' | 'title' | 'lesson_id' | 'estimated_minutes' | 'order_index'
>;

/** Never build a wall of tasks, however low the per-task minutes are. */
const MAX_TASKS = 5;

/** Minutes to allow for a vocabulary review, derived from how much is due. */
const reviewMinutes = (dueCount: number) => Math.min(8, Math.max(2, Math.ceil(dueCount * 0.4)));

/**
 * Builds the day's plan.
 *
 * The ordering rule is the product's whole premise: the weakest region goes
 * first, because that is where a session buys the most. Within a region, lessons
 * keep their course order so the sequence still makes sense. The plan stops as
 * soon as it covers the daily goal - overshooting it turns a 10-minute promise
 * into a chore.
 */
export const buildDailyPlan = ({
  regions,
  lessons,
  dueVocabularyCount,
  dailyGoalMinutes,
}: PlannerInput): TaskDraft[] => {
  const strengthOf = new Map(regions.map(region => [region.code, region.strength]));
  // Unknown regions sort last rather than first, so a data gap cannot hijack the plan.
  const rank = (code: RegionCode) => strengthOf.get(code) ?? 101;

  const candidates: TaskDraft[] = lessons
    .filter(lesson => !lesson.isCompleted)
    .map((lesson, index) => ({
      region_code: REGION_FOR_LESSON_KIND[lesson.kind],
      title: lesson.title,
      lesson_id: lesson.id,
      estimated_minutes: Math.max(1, lesson.estimated_minutes),
      order_index: index,
    }))
    .sort((a, b) => {
      const byRegion = rank(a.region_code) - rank(b.region_code);
      return byRegion !== 0 ? byRegion : a.order_index - b.order_index;
    });

  // A due review is time-critical in a way a lesson is not: the words are already
  // fading, so it leads the plan.
  if (dueVocabularyCount > 0) {
    candidates.unshift({
      region_code: 'memory',
      title: `Review ${dueVocabularyCount} ${dueVocabularyCount === 1 ? 'word' : 'words'}`,
      lesson_id: null,
      estimated_minutes: reviewMinutes(dueVocabularyCount),
      order_index: -1,
    });
  }

  const plan: TaskDraft[] = [];
  let minutes = 0;

  for (const candidate of candidates) {
    if (plan.length >= MAX_TASKS) {
      break;
    }
    // Always take the first task, then stop once the goal is covered.
    if (plan.length > 0 && minutes >= dailyGoalMinutes) {
      break;
    }
    plan.push({...candidate, order_index: plan.length});
    minutes += candidate.estimated_minutes;
  }

  return plan;
};

export const planMinutes = (plan: TaskDraft[]) =>
  plan.reduce((total, task) => total + task.estimated_minutes, 0);
