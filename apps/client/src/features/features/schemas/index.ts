import { z } from 'zod';

export const featureListSchema = z.array(
  z.object({
    id: z.uuid(),
    name: z.string(),
  }),
);
