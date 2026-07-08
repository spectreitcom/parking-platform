import { z } from 'zod';

export const placeTypeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  version: z.int().positive(),
});

export const placeTypesListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(30),
  search: z.string().max(100).optional(),
});

export const placeTypesListSchema = z.object({
  data: z.array(placeTypeSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});
