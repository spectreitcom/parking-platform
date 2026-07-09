import { z } from 'zod';

export const createCartInputSchema = z.object({
  parkingSpotId: z.uuid(),
  arrival: z.int().positive(),
  departure: z.int().positive(),
});

export const genericCartResponseSchema = z.object({ id: z.uuid() });

export const updateCartInputSchema = z.object({
  arrival: z.int().positive(),
  departure: z.int().positive(),
  addonIds: z.array(z.uuid()),
  cartId: z.uuid(),
});

export const getCartInputSchema = z.object({
  cartId: z.uuid(),
});

export const getCartResponseSchema = z.object({
  id: z.uuid(),
  parkingSpotId: z.uuid(),
  arrival: z.int().positive(),
  departure: z.int().positive(),
  pricePerDay: z.number(),
  addons: z.array(
    z.object({
      id: z.uuid(),
      price: z.number(),
    }),
  ),
  createdAt: z.coerce.date(),
  total: z.number(),
  days: z.int().positive(),
  userId: z.uuid().nullish(),
});
