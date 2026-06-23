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

export const parkingDetailsInputSchema = z.object({
  parkingId: z.uuid(),
});

export const parkingDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  coords: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  statute: z.string(),
  description: z.string(),
  organization: z.object({
    id: z.uuid(),
    name: z.string(),
    address: z.string(),
  }),
  parkingFeatures: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
    }),
  ),
  parkingAddons: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
    }),
  ),
  place: z.object({
    id: z.uuid(),
    name: z.string(),
    address: z.string(),
  }),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  version: z.number().int().positive(),
  assetIds: z.array(z.uuid()),
  actions: z.object({
    edit: z.boolean(),
    addParkingSpot: z.boolean(),
    removeParkingSpot: z.boolean(),
  }),
});

export const updateParkingInputSchema = z.object({
  parkingId: z.uuid(),
  name: z.string(),
  assetIds: z.array(z.uuid()),
  parkingFeatureIds: z.array(z.uuid()),
  parkingAddonIds: z.array(z.uuid()),
  description: z.string().optional(),
  statute: z.string().optional(),
  version: z.int().positive(),
});
