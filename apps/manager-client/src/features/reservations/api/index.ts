import { createServerFn } from '@tanstack/react-start';
import {
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
