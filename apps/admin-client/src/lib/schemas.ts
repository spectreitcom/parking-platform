import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(), // todo;
  detail: z.string(),
  status: z.number().positive(),
});
