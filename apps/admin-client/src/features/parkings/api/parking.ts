import { createServerFn } from '@tanstack/react-start';
import {
  activateAndDeactivateParkingInputSchema,
  createParkingInputSchema,
  getParkingDetailsInputSchema,
  parkingDetailsSchema,
  parkingListBaseInputSchema,
  parkingListSchema,
  updateParkingInputSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { genericResponseSchema } from '#/lib/schemas.ts';

export const getParkingList = createServerFn()
  .validator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/parkings?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const createParking = createServerFn()
  .validator(createParkingInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/parkings`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getParkingDetails = createServerFn()
  .validator(getParkingDetailsInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${data.parkingId}`,
      { method: 'GET' },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingDetailsSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const updateParking = createServerFn()
  .validator(updateParkingInputSchema)
  .handler(async ({ data }) => {
    const { parkingId, ...rest } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${parkingId}`,
      { method: 'PUT', body: JSON.stringify({ ...rest }) },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const activateParking = createServerFn()
  .validator(activateAndDeactivateParkingInputSchema)
  .handler(async ({ data }) => {
    const { parkingId, version } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${parkingId}/activate`,
      { method: 'POST', body: JSON.stringify({ version }) },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const deactivateParking = createServerFn()
  .validator(activateAndDeactivateParkingInputSchema)
  .handler(async ({ data }) => {
    const { parkingId, version } = data;
    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${parkingId}/deactivate`,
      { method: 'POST', body: JSON.stringify({ version }) },
    );
    await genericApiErrorHandler(response);
    const responseData = await response.json();
    const validationResult = genericResponseSchema.safeParse(responseData);
    if (!validationResult.success) {
      throw defaultServerError;
    }
    return validationResult.data;
  });
