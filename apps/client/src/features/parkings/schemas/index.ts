import { z } from 'zod';

export const parkingDetailsOrganization = z.object({
  id: z.uuid(),
  name: z.string(),
});

export const featureSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export const parkingSpotSchema = z.object({
  id: z.uuid(),
  pricePerDay: z.number(),
  pricePerDayPLN: z.number(),
  available: z.boolean(),
  parkingSpotFeatures: z.array(featureSchema),
  priceTotal: z.number(),
  priceTotalPLN: z.number(),
});

export const placeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  address: z.string(),
});

export const parkingDetailsSchema = z.object({
  parkingId: z.uuid(),
  name: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  organization: parkingDetailsOrganization,
  assetIds: z.array(z.uuid()),
  parkingFeatures: z.array(featureSchema),
  place: placeSchema,
  address: z.string(),
  parkingSpots: z.array(parkingSpotSchema),
});

export const parkingDetailsInputSchema = z.object({
  parkingId: z.uuid(),
  departure: z.int().positive(), // in seconds
  arrival: z.int().positive(), // in seconds
});
