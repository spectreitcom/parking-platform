import { createServerFn } from '@tanstack/react-start';
import {
  createParkingFeatureInputSchema,
  createParkingFeatureResponseSchema,
  deleteParkingFeatureInputSchema,
  getParkingFeatureByIdInputSchema,
  parkingFeaturesListItemSchema,
  parkingFeaturesListSchema,
  parkingListBaseInputSchema,
  updateParkingFeatureInputSchema,
} from '#/features/parkings/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '@repo/frontend-utils';

export const getParkingFeatures = createServerFn()
  .validator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-features?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingFeaturesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const createParkingFeature = createServerFn()
  .validator(createParkingFeatureInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/parking-features`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createParkingFeatureResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const updateParkingFeature = createServerFn()
  .validator(updateParkingFeatureInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parking-features/${data.parkingFeatureId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          levels: data.levels,
          version: data.version,
        }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createParkingFeatureResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const deleteParkingFeature = createServerFn()
  .validator(deleteParkingFeatureInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ version: data.version });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-features/${data.parkingFeatureId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createParkingFeatureResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getParkingFeatureById = createServerFn()
  .validator(getParkingFeatureByIdInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parking-features/${data.parkingFeatureId}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      parkingFeaturesListItemSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
