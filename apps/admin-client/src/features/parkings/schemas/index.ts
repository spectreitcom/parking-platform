import { z } from 'zod';

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

export const parkingListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});
