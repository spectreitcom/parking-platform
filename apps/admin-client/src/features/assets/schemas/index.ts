import { z } from 'zod';

export const getImageInputSchema = z.object({
  assetId: z.uuid(),
  width: z.number().min(1).max(1920).optional(),
  height: z.number().min(1).max(1080).optional(),
});
