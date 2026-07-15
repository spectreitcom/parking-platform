import { z } from 'zod';

export const reservationsListItemSchema = z.object({
  reservationId: z.uuid(),
  cartId: z.uuid(),
  parkingSpotId: z.uuid(),
  parkingId: z.uuid(),
  user: z.object({
    id: z.uuid(),
    email: z.string(),
    name: z.string(),
  }),
  arrival: z.int().positive(),
  departure: z.int().positive(),
  lines: z.array(
    z.object({
      title: z.string(),
      price: z.int().nonnegative(),
    }),
  ),
  total: z.int().nonnegative(),
  status: z.string(),
  registrationNumber: z.string(),
  version: z.int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const completeReservationInputSchema = z.object({
  reservationId: z.uuid(),
  version: z.int().positive(),
});

export const reservationsListInputSchema = z.object({
  parkingId: z.uuid(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(30),
  search: z.string().optional(),
});

export const reservationsListSchema = z.object({
  data: z.array(reservationsListItemSchema),
  total: z.int().nonnegative(),
  currentPage: z.int().positive(),
});
