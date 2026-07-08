import { z } from 'zod';

export const searchInputSchema = z.object({
  placeId: z.uuid(),
  arrival: z.int().positive(),
  departure: z.int().positive(),
  featureIds: z.array(z.uuid()).optional(),
});

export const searchResultSchema = z.object({
  parkingId: z.uuid(),
  parkingSpotId: z.uuid().nullable(),
  parkingName: z.string(),
  assetIds: z.array(z.uuid()),
  features: z.array(
    z.object({
      name: z.string(),
    }),
  ),
  distance: z.number(),
  totalPrice: z.number().nullable(),
  totalPricePLN: z.number().nullable(),
});

export const searchResultsSchema = z.array(searchResultSchema);
