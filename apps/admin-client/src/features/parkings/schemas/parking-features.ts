import { z } from 'zod';

export const parkingFeatureLevels = ['PARKING', 'PARKING_SPOT'] as const;

const parkingFeatureLevelSchema = z.enum(parkingFeatureLevels);

export const parkingFeaturesListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  levels: z.array(parkingFeatureLevelSchema),
  version: z.number().int().positive(),
});

export type ParkingFeaturesListItemSchema = z.infer<
  typeof parkingFeaturesListItemSchema
>;

export const parkingFeaturesListSchema = z.object({
  data: z.array(parkingFeaturesListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const createParkingFeatureInputSchema = z.object({
  name: z.string().min(3).max(60),
  levels: z.array(parkingFeatureLevelSchema),
});

export const createParkingFeatureResponseSchema = z.object({
  id: z.uuid(),
});

export const updateParkingFeatureInputSchema =
  createParkingFeatureInputSchema.extend({
    version: z.number().int().positive(),
    parkingFeatureId: z.uuid(),
  });

export const deleteParkingFeatureInputSchema = z.object({
  parkingFeatureId: z.uuid(),
  version: z.number().int().positive(),
});

export const getParkingFeatureByIdInputSchema = z.object({
  parkingFeatureId: z.uuid(),
});
