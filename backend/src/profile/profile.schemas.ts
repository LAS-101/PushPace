import { z } from 'zod';

export const updateProfileSchema = z.object({
  weight: z.coerce
    .number()
    .min(30, 'Invalid weight. Must be between 30 and 300 kg.')
    .max(300, 'Invalid weight. Must be between 30 and 300 kg.'),
  height: z.coerce
    .number()
    .int()
    .min(100, 'Invalid height. Must be between 100 and 250 cm.')
    .max(250, 'Invalid height. Must be between 100 and 250 cm.'),
  age: z.coerce
    .number()
    .int()
    .min(10, 'Invalid age. Must be between 10 and 120.')
    .max(120, 'Invalid age. Must be between 10 and 120.'),
  gender: z.enum(
    ['male', 'female'],
    'Invalid gender. Must be "male" or "female".',
  ),
});
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
