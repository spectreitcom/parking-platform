import { z } from 'zod';

export const getUsersInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(255).optional(),
});

export type GetUsersInputSchema = z.infer<typeof getUsersInputSchema>;

export const userItemSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  provider: z.string(),
});

export type UserItemSchema = z.infer<typeof userItemSchema>;

export const usersListSchema = z.object({
  data: z.array(userItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});
