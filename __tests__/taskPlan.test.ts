import {buildDailyPlan, planMinutes, REGION_FOR_LESSON_KIND} from '@/utils/taskPlan';
import type {PlannerLesson, PlannerRegion} from '@/utils/taskPlan';

const regions: PlannerRegion[] = [
  {code: 'reading', strength: 78},
  {code: 'writing', strength: 62},
  {code: 'memory', strength: 51},
  {code: 'speaking', strength: 34},
  {code: 'listening', strength: 29},
];

const lesson = (over: Partial<PlannerLesson> & {id: string}): PlannerLesson => ({
  title: `Lesson ${over.id}`,
  kind: 'reading',
  estimated_minutes: 5,
  isCompleted: false,
  ...over,
});

describe('buildDailyPlan', () => {
  it('puts the weakest region first', () => {
    const plan = buildDailyPlan({
      regions,
      lessons: [
        lesson({id: 'r', kind: 'reading'}),
        lesson({id: 'l', kind: 'listening'}),
        lesson({id: 's', kind: 'speaking'}),
      ],
      dueVocabularyCount: 0,
      dailyGoalMinutes: 15,
    });

    // listening (29) is weakest, then speaking (34), then reading (78).
    expect(plan.map(task => task.region_code)).toEqual(['listening', 'speaking', 'reading']);
  });

  it('leads with a review when words are already due', () => {
    const plan = buildDailyPlan({
      regions,
      lessons: [lesson({id: 'l', kind: 'listening'})],
      dueVocabularyCount: 12,
      dailyGoalMinutes: 15,
    });

    expect(plan[0]?.region_code).toBe('memory');
    expect(plan[0]?.title).toContain('12 words');
    expect(plan[0]?.lesson_id).toBeNull();
  });

  it('says "word" for a single due item', () => {
    const plan = buildDailyPlan({
      regions,
      lessons: [],
      dueVocabularyCount: 1,
      dailyGoalMinutes: 10,
    });
    expect(plan[0]?.title).toBe('Review 1 word');
  });

  it('stops once the daily goal is covered', () => {
    const plan = buildDailyPlan({
      regions,
      lessons: Array.from({length: 6}, (_, i) =>
        lesson({id: `x${i}`, kind: 'listening', estimated_minutes: 4}),
      ),
      dueVocabularyCount: 0,
      dailyGoalMinutes: 10,
    });

    expect(planMinutes(plan)).toBeGreaterThanOrEqual(10);
    // Should not keep adding well past the goal.
    expect(plan.length).toBeLessThanOrEqual(3);
  });

  it('always offers at least one task, even below the goal', () => {
    const plan = buildDailyPlan({
      regions,
      lessons: [lesson({id: 'only', estimated_minutes: 2})],
      dueVocabularyCount: 0,
      dailyGoalMinutes: 30,
    });
    expect(plan).toHaveLength(1);
  });

  it('skips completed lessons', () => {
    const plan = buildDailyPlan({
      regions,
      lessons: [lesson({id: 'done', isCompleted: true}), lesson({id: 'todo'})],
      dueVocabularyCount: 0,
      dailyGoalMinutes: 10,
    });
    expect(plan.map(task => task.lesson_id)).toEqual(['todo']);
  });

  it('returns nothing when there is no content and nothing due', () => {
    expect(
      buildDailyPlan({regions, lessons: [], dueVocabularyCount: 0, dailyGoalMinutes: 10}),
    ).toEqual([]);
  });

  it('numbers tasks from zero without gaps', () => {
    const plan = buildDailyPlan({
      regions,
      lessons: [lesson({id: 'a'}), lesson({id: 'b'})],
      dueVocabularyCount: 3,
      dailyGoalMinutes: 30,
    });
    expect(plan.map(task => task.order_index)).toEqual(plan.map((_, index) => index));
  });

  /** A missing region row must not promote that lesson to the top of the plan. */
  it('sorts lessons with unknown regions last', () => {
    const plan = buildDailyPlan({
      regions: [{code: 'listening', strength: 90}],
      lessons: [lesson({id: 'unknown', kind: 'writing'}), lesson({id: 'known', kind: 'listening'})],
      dueVocabularyCount: 0,
      dailyGoalMinutes: 60,
    });
    expect(plan.map(task => task.lesson_id)).toEqual(['known', 'unknown']);
  });

  it('maps every lesson kind to a region', () => {
    for (const kind of Object.keys(REGION_FOR_LESSON_KIND)) {
      expect(REGION_FOR_LESSON_KIND[kind as keyof typeof REGION_FOR_LESSON_KIND]).toBeTruthy();
    }
  });
});
