import { createServerFn } from '@tanstack/react-start';
import {
  completeReservationInputSchema,
  reservationsListInputSchema,
  reservationsListSchema,
} from '#/features/reservations/schemas';
import { createSearchParams } from '@repo/frontend-utils';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const reservationsList = createServerFn()
  .validator(reservationsListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      parkingId: data.parkingId,
      page: data.page,
      limit: data.limit,
      search: data.search ?? '',
    });

    const response = await authFetch(
      `${env.SERVER_URL}/reservations?${searchParams.toString()}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = reservationsListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const completeReservation = createServerFn()
  .validator(completeReservationInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/reservations/${data.reservationId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ version: data.version }),
      },
    );

    await genericApiErrorHandler(response);

    return (await response.json()) as { id: string };
  });
