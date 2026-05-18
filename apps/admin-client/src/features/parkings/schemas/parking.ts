import { z } from 'zod';

export const parkingListBaseInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(255).optional(),
});

export const parkingListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  active: z.boolean(),
  place: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
  organization: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
  version: z.number().int().positive(),
});

export type ParkingListItemSchema = z.infer<typeof parkingListItemSchema>;

export const parkingListSchema = z.object({
  data: z.array(parkingListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const createParkingInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1).max(255),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  organizationId: z.uuid(),
  placeId: z.uuid(),
});
