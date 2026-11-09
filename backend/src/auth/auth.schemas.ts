import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(255),
  email: z.email('Invalid email format').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof loginSchema>;
