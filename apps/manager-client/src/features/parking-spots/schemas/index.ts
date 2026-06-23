import { z } from 'zod';

export const parkingSpotListItemSchema = z.object({
  id: z.uuid(),
  active: z.boolean(),
  version: z.number().int().positive(),
  price: z.number(),
  parkingSpotFeatures: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
    }),
  ),
});

export const parkingSpotListSchema = z.object({
  data: z.array(parkingSpotListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const parkingSpotsListInputSchema = z.object({
  parkingId: z.uuid(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(30),
});

export const addParkingSpotInputSchema = z.object({
  parkingFeatureIds: z.array(z.uuid()),
  price: z.number().int().positive(),
  parkingId: z.uuid(),
});

export const updateParkingSpotInputSchema = addParkingSpotInputSchema
  .omit({
    parkingId: true,
  })
  .extend({
    parkingSpotId: z.uuid(),
    version: z.number().int().positive(),
  });
