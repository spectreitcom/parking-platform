import { z } from 'zod';

export const uploadImageInputSchema = z.object({
  file: z.file().max(2 * 1024 * 1024),
});

export const uploadImageResponseSchema = z.object({
  id: z.uuid(),
});

export const getImageInputSchema = z.object({
  assetId: z.uuid(),
  width: z.number().min(1).max(1920).optional(),
  height: z.number().min(1).max(1080).optional(),
});
