import { createServerFn } from '@tanstack/react-start';
import {
  parkingDetailSchema,
  parkingDetailsInputSchema,
  parkingListBaseInputSchema,
  parkingListSchema,
} from '#/features/parking/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '@repo/frontend-utils';

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
