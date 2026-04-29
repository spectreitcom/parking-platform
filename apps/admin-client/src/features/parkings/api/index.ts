import { createServerFn } from '@tanstack/react-start';
import {
  parkingListBaseInputSchema,
  parkingListSchema,
  placeTypesListSchema,
} from '#/features/parkings/schemas';
import { authFetch } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '#/lib/utils.ts';

export const getParkingList = createServerFn()
  .inputValidator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/parkings?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch parking list');
    }

    const responseData = await response.json();

    const validationResult = parkingListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });

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
