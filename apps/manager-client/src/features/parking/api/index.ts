import { createServerFn } from '@tanstack/react-start';
import {
  parkingDetailSchema,
  parkingDetailsInputSchema,
  parkingListBaseInputSchema,
  parkingListSchema,
  updateParkingInputSchema,
} from '#/features/parking/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '@repo/frontend-utils';
import { genericResponseSchema } from '#/lib/schemas.ts';

export const getParkings = createServerFn()
  .validator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/parkings?${searchParams.toString()}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getParkingDetails = createServerFn()
  .validator(parkingDetailsInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${data.parkingId}/details`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingDetailSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const updateParking = createServerFn()
  .validator(updateParkingInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${data.parkingId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          assetIds: data.assetIds,
          parkingFeatureIds: data.parkingFeatureIds,
          parkingAddonIds: data.parkingAddonIds,
          description: data.description ?? '',
          statute: data.statute ?? '',
          version: data.version,
        }),
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
