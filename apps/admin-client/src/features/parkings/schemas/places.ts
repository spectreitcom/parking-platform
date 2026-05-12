import { z } from 'zod';

export const placesListBaseInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(255).optional(),
});

export const placesListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  address: z.string(),
  active: z.boolean(),
  placeTypeName: z.string(),
  version: z.number().int().positive(),
});

export type PlacesListItemSchema = z.infer<typeof placesListItemSchema>;

export const placesListSchema = z.object({
  data: z.array(placesListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const createPlaceInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  placeTypeId: z.uuid('Place Type is required'),
  address: z.string().trim().min(1).max(255),
});

export const updatePlaceInputSchema = createPlaceInputSchema.extend({
  version: z.number().int().positive(),
  placeId: z.uuid(),
});

export const activatePlaceInputSchema = z.object({
  placeId: z.uuid(),
  version: z.number().int().positive(),
});

export const genericResponseSchema = z.object({
  id: z.uuid(),
});

export const getPlaceForEditingInputSchema = z.object({
  placeId: z.uuid(),
});

export const getPlaceForEditingResponseSchema = z.object({
  placeId: z.uuid(),
  name: z.string(),
  address: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  placeTypeId: z.uuid(),
  placeTypeName: z.string(),
  active: z.boolean(),
  version: z.number().int().positive(),
});

export type GetPlaceForEditingResponseSchema = z.infer<
  typeof getPlaceForEditingResponseSchema
>;
