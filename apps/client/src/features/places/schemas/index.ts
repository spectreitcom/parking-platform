import { z } from 'zod';

export const placesListItemSchema = z.object({
  placeId: z.uuid(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  placeTypeId: z.uuid(),
  placeTypeName: z.string(),
  address: z.string(),
  active: z.boolean(),
  version: z.int().positive(),
});

export const placesListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(30),
  search: z.string().max(100).optional(),
  placeTypeId: z.uuid().optional(),
});

export const placesListSchema = z.object({
  data: z.array(placesListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const placeDetailsInputSchema = z.object({
  placeId: z.uuid(),
});
