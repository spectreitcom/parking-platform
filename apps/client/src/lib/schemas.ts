import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  detail: z.string(),
  status: z.number().positive(),
});

export const genericResponseSchema = z.object({
  id: z.uuid(),
});
