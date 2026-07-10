import { z } from 'zod';

export const createReservationInputSchema = z.object({
  cartId: z.uuid(),
  registrationNumber: z.string(),
});

export const reservationGenericResponse = z.object({
  id: z.string(),
});

export const cancelReservationInputSchema = z.object({
  reservationId: z.uuid(),
  version: z.int().positive(),
});

export const updateReservationInputSchema = z.object({
  reservationId: z.uuid(),
  version: z.int().positive(),
  registrationNumber: z.string(),
});

export const reservationsListItemSchema = z.object({
  id: z.uuid(),
  registrationNumber: z.coerce.string(),
  parkingSpotId: z.uuid(),
  parking: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  arrivalDate: z.coerce.date(),
  departureDate: z.coerce.date(),
  version: z.int().positive(),
  canCancel: z.boolean(),
  canEdit: z.boolean(),
});

export const reservationsListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(30),
  search: z.string().max(100).optional(),
});

export const reservationsListResponseSchema = z.object({
  data: z.array(reservationsListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const reservationDetailsInputSchema = z.object({
  reservationId: z.uuid(),
});

export const reservationDetailsSchema = z.object({
  reservationId: z.uuid(),
  cartId: z.uuid(),
  total: z.number(),
  parkingSpot: z.object({
    id: z.uuid(),
    price: z.number(),
    pricePLN: z.number(),
  }),
  parking: z.object({
    id: z.uuid(),
    name: z.string(),
    address: z.string(),
  }),
  userId: z.uuid(),
  arrival: z.int().positive(),
  departure: z.int().positive(),
  lines: z.array(
    z.object({
      title: z.string(),
      price: z.number(),
    }),
  ),
  status: z.string(),
  registrationNumber: z.string(),
  version: z.int().positive(),
  canCancel: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
