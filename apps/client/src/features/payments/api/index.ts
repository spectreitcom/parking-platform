import { createServerFn } from '@tanstack/react-start';
import {
  markReservationAsPaidInputSchema,
  markReservationAsPaidOutputSchema,
} from '#/features/payments/schemas';
import { authFetch, genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { parseJsonResponse } from '#/lib/api-response.ts';

export const markReservationAsPaid = createServerFn()
  .validator(markReservationAsPaidInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/payments/mark-as-paid`,
      {
        method: 'POST',
        body: JSON.stringify({
          reservationId: data.reservationId,
        }),
      },
    );

    await genericApiErrorHandler(response);

    return parseJsonResponse(response, markReservationAsPaidOutputSchema);
  });
