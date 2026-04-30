import { z } from 'zod';

export const placeTypesListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  version: z.number().int().positive(),
});

export type PlaceTypesListItemSchema = z.infer<typeof placeTypesListItemSchema>;

export const placeTypesListSchema = z.object({
  data: z.array(placeTypesListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const createPlaceTypeInputSchema = z.object({
  name: z.string().min(3).max(60),
});

export const createPlaceTypeResponseSchema = z.object({
  id: z.uuid(),
});

export const updatePlaceTypeInputSchema = createPlaceTypeInputSchema.extend({
  version: z.number().int().positive(),
  placeTypeId: z.uuid(),
});

export const deletePlaceTypeInputSchema = z.object({
  placeTypeId: z.uuid(),
  version: z.number().int().positive(),
});
