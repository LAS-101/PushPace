import { z } from 'zod';

export const ACTIVITY_TYPES = ['walking', 'gym', 'running'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const activityTypeSchema = z.enum(
  ACTIVITY_TYPES,
  'Invalid activity type. Use: walking, gym, or running.',
);
export const activityIdSchema = z.coerce
  .number('Invalid id.')
  .int('Invalid id.')
  .positive('Invalid id.');

const date = z.iso.date('Invalid date format. Use YYYY-MM-DD.');
const duration = z.coerce.number().int().min(1, 'Invalid duration.');
const calories = z.coerce.number().int().min(0, 'Invalid calories.');
// DECIMAL(5,2) columns
const distance = z.coerce.number().min(0, 'Invalid distance.').max(999.99);

export const walkingSchema = z.object({
  date,
  duration,
  distance,
  steps: z.coerce.number().int().min(0, 'Invalid steps.'),
  calories,
});
export type CreateWalkingDto = z.infer<typeof walkingSchema>;

export const runningSchema = z.object({
  date,
  duration,
  distance,
  // DECIMAL(4,2)
  pace: z.coerce.number().min(0, 'Invalid pace.').max(99.99),
  calories,
});
export type CreateRunningDto = z.infer<typeof runningSchema>;

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required').max(255),
  sets: z.coerce.number().int().min(0),
  reps: z.coerce.number().int().min(0),
  weight: z.coerce.number().min(0).max(999.99),
});

export const gymSchema = z.object({
  date,
  duration,
  calories,
  exercises: z
    .array(exerciseSchema)
    .min(1, 'At least one exercise is required'),
});
export type CreateGymDto = z.infer<typeof gymSchema>;

/** Body schema for each activity type. */
export const CREATE_SCHEMAS = {
  walking: walkingSchema,
  running: runningSchema,
  gym: gymSchema,
} satisfies Record<ActivityType, z.ZodType>;
