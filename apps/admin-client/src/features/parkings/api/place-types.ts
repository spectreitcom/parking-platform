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
import { authFetch } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const getPlaceTypes = createServerFn()
  .inputValidator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/place-types?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place types');
    }

    const responseData = await response.json();

    const validationResult = placeTypesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });

export const createPlaceType = createServerFn()
  .inputValidator(createPlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/place-types`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create place type');
    }

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });

export const updatePlaceType = createServerFn()
  .inputValidator(updatePlaceTypeInputSchema)
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

    if (!response.ok) {
      throw new Error('Failed to update place type');
    }

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });

export const deletePlaceType = createServerFn()
  .inputValidator(deletePlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ version: data.version });

    const response = await authFetch(
      `${env.SERVER_URL}/place-types/${data.placeTypeId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to delete place type');
    }

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });
