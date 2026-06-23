import { z } from 'zod';

export const uploadImageInputSchema = z.object({
  file: z.file().max(2 * 1024 * 1024),
});

export const uploadImageResponseSchema = z.object({
  id: z.uuid(),
});
