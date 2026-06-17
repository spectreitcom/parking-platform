import { z } from 'zod';

export const parkingListBaseInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  organizationId: z.uuid(),
});

export const parkingItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  active: z.boolean(),
  place: z.object({
    id: z.uuid(),
    name: z.string(),
    address: z.string(),
  }),
  version: z.number().int().positive(),
});

export const parkingListSchema = z.object({
  data: z.array(parkingItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});
