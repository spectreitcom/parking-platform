import { z } from 'zod';

const levelsEnum = z.enum(['PARKING', 'PARKING_SPOT']);

export const parkingFeatureListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  levels: z.array(levelsEnum),
  version: z.number().int().positive(),
});

export const parkingFeatureListSchema = z.object({
  data: z.array(parkingFeatureListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const parkingFeaturesListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(30),
  search: z.string().optional(),
  levels: z.array(levelsEnum).optional(),
});
