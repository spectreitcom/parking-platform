import { createServerFn } from '@tanstack/react-start';
import {
  cancelReservationInputSchema,
  createReservationInputSchema,
  reservationDetailsInputSchema,
  reservationDetailsSchema,
  reservationGenericResponse,
  reservationsListInputSchema,
  reservationsListResponseSchema,
  updateReservationInputSchema,
} from '#/features/reservations/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '@repo/frontend-utils';

export const createReservation = createServerFn()
  .validator(createReservationInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/reservations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = reservationGenericResponse.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const cancelReservation = createServerFn()
  .validator(cancelReservationInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/reservations/${data.reservationId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ version: data.version }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = reservationGenericResponse.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const updateReservation = createServerFn()
  .validator(updateReservationInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/reservations/${data.reservationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          version: data.version,
          registrationNumber: data.registrationNumber,
        }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = reservationGenericResponse.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getReservationsList = createServerFn()
  .validator(reservationsListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      page: data.page,
      limit: data.limit,
      search: data.search ?? '',
    });

    const response = await authFetch(
      `${env.SERVER_URL}/reservations?${searchParams.toString()}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      reservationsListResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const reservationDetails = createServerFn()
  .validator(reservationDetailsInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/reservations/${data.reservationId}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = reservationDetailsSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
