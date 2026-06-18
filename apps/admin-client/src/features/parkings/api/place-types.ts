import { createServerFn } from '@tanstack/react-start';
import {
  createPlaceTypeInputSchema,
  createPlaceTypeResponseSchema,
  deletePlaceTypeInputSchema,
  parkingListBaseInputSchema,
  placeTypesListSchema,
  updatePlaceTypeInputSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const getPlaceTypes = createServerFn()
  .validator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/place-types?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = placeTypesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const createPlaceType = createServerFn()
  .validator(createPlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/place-types`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const updatePlaceType = createServerFn()
  .validator(updatePlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/place-types/${data.placeTypeId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          version: data.version,
        }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const deletePlaceType = createServerFn()
  .validator(deletePlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ version: data.version });

    const response = await authFetch(
      `${env.SERVER_URL}/place-types/${data.placeTypeId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
