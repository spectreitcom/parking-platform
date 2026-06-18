import { createServerFn } from '@tanstack/react-start';
import {
  activatePlaceInputSchema,
  createPlaceInputSchema,
  getPlaceForEditingInputSchema,
  getPlaceForEditingResponseSchema,
  placesListBaseInputSchema,
  placesListSchema,
  updatePlaceInputSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { genericResponseSchema } from '#/lib/schemas.ts';

export const getPlacesList = createServerFn()
  .validator(placesListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/places?${searchParams.toString()}`,
      { method: 'GET' },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = placesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const createPlace = createServerFn()
  .validator(createPlaceInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/places`, {
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

export const updatePlace = createServerFn()
  .validator(updatePlaceInputSchema)
  .handler(async ({ data }) => {
    const { placeId, ...restData } = data;
    const response = await authFetch(`${env.SERVER_URL}/places/${placeId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...restData }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const activatePlace = createServerFn()
  .validator(activatePlaceInputSchema)
  .handler(async ({ data }) => {
    const { placeId, ...restData } = data;
    const response = await authFetch(
      `${env.SERVER_URL}/places/${placeId}/activate`,
      {
        method: 'POST',
        body: JSON.stringify({ ...restData }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const deactivatePlace = createServerFn()
  .validator(activatePlaceInputSchema)
  .handler(async ({ data }) => {
    const { placeId, ...restData } = data;
    const response = await authFetch(
      `${env.SERVER_URL}/places/${placeId}/deactivate`,
      {
        method: 'POST',
        body: JSON.stringify({ ...restData }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getPlaceForEditing = createServerFn()
  .validator(getPlaceForEditingInputSchema)
  .handler(async ({ data }) => {
    const { placeId } = data;

    const response = await authFetch(`${env.SERVER_URL}/places/${placeId}`, {
      method: 'GET',
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      getPlaceForEditingResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
