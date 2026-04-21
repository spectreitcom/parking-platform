import { z } from 'zod';

export const adminListItemSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string(),
  statusText: z.string(),
});

export type AdminListItemSchema = z.infer<typeof adminListItemSchema>;

export const adminsListSchema = z.object({
  data: z.array(adminListItemSchema),
  total: z.number(),
  currentPage: z.number().positive(),
});

export const adminListInputSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
  search: z.string().optional(),
});

export type AdminListInputSchema = z.infer<typeof adminListInputSchema>;
