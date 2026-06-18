import { createServerFn } from '@tanstack/react-start';
import {
  getParkingSpotsByParkingIdInputSchema,
  parkingSpotListSchema,
} from '#/features/parkings/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '#/lib/utils.ts';

export const getParkingSpotsByParkingId = createServerFn()
  .validator(getParkingSpotsByParkingIdInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      ...data,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-spots?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingSpotListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
