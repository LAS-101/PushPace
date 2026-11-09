import {
  activityIdSchema,
  activityTypeSchema,
  gymSchema,
  runningSchema,
  walkingSchema,
} from './activities.schemas.js';

describe('activity schemas', () => {
  it('accepts a valid walking activity and coerces numeric strings', () => {
    const result = walkingSchema.parse({
      date: '2026-02-26',
      duration: '45',
      distance: 4.2,
      steps: 5400,
      calories: 210,
    });
    expect(result).toEqual({
      date: '2026-02-26',
      duration: 45,
      distance: 4.2,
      steps: 5400,
      calories: 210,
    });
  });

  it('rejects impossible dates and zero duration', () => {
    const result = walkingSchema.safeParse({
      date: '2026-02-30',
      duration: 0,
      distance: 1,
      steps: 1,
      calories: 1,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0])).toEqual([
      'date',
      'duration',
    ]);
  });

  it('caps running pace to fit DECIMAL(4,2)', () => {
    const base = {
      date: '2026-02-27',
      duration: 35,
      distance: 5.2,
      calories: 310,
    };
    expect(runningSchema.safeParse({ ...base, pace: 6.7 }).success).toBe(true);
    expect(runningSchema.safeParse({ ...base, pace: 100 }).success).toBe(false);
  });

  it('requires at least one named exercise for gym workouts', () => {
    const base = { date: '2026-02-26', duration: 60, calories: 300 };
    expect(gymSchema.safeParse({ ...base, exercises: [] }).success).toBe(false);
    expect(
      gymSchema.safeParse({
        ...base,
        exercises: [{ name: '  ', sets: 3, reps: 10, weight: 0 }],
      }).success,
    ).toBe(false);

    const ok = gymSchema.parse({
      ...base,
      exercises: [{ name: ' Squats ', sets: 4, reps: 8, weight: 80 }],
    });
    expect(ok.exercises[0].name).toBe('Squats');
  });

  it('validates route params', () => {
    expect(activityTypeSchema.safeParse('gym').success).toBe(true);
    expect(activityTypeSchema.safeParse('swimming').success).toBe(false);
    expect(activityIdSchema.parse('12')).toBe(12);
    expect(activityIdSchema.safeParse('abc').success).toBe(false);
    expect(activityIdSchema.safeParse('-1').success).toBe(false);
  });
});
