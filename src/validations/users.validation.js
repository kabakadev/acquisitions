import { z } from 'zod';

export const userIdSchema = z.object({
  params: z.object({
    id: z.coerce
      .number()
      .int()
      .positive('Invalid user ID format. Must be a positive integer.'),
  }),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      email: z.string().email('Invalid email address').optional(),
      role: z
        .enum(['user', 'admin'], {
          errorMap: () => ({ message: 'Role must be either user or admin' }),
        })
        .optional(),
    })
    .strict(),
});
