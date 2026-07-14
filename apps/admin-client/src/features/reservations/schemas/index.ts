import { z } from 'zod';

export const reservationsListItemSchema = z.object({
  id: z.uuid(),
  registrationNumber: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
    provider: z.string(),
  }),
  payment: z
    .object({
      id: z.uuid(),
      reservationId: z.uuid(),
      userId: z.uuid(),
      amount: z.number(),
      createdAt: z.coerce.date(),
      paidAt: z.coerce.date().nullable(),
    })
    .nullable(),
});

export type ReservationsListItemSchema = z.infer<
  typeof reservationsListItemSchema
>;

export const reservationsListSchema = z.object({
  data: z.array(reservationsListItemSchema),
  total: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
});

export const reservationsListInputSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(255).optional(),
});
