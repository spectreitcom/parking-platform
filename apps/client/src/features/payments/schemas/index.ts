import { z } from 'zod';

export const markReservationAsPaidInputSchema = z.object({
  reservationId: z.uuid(),
});

export const markReservationAsPaidOutputSchema = z.object({
  id: z.uuid(),
});
