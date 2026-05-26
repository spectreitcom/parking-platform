import { z } from 'zod';

export const parkingSpotListItemSchema = z.object({
  id: z.uuid(),
  price: z.number(),
  active: z.boolean(),
  version: z.number().int().nonnegative(),
  parkingSpotFeatures: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
    }),
  ),
});

export type ParkingSpotListItemSchema = z.infer<
  typeof parkingSpotListItemSchema
>;

export const parkingSpotListSchema = z.object({
  data: z.array(parkingSpotListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const getParkingSpotsByParkingIdInputSchema = z.object({
  parkingId: z.uuid(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
