import { createServerFn } from '@tanstack/react-start';
import {
  parkingSpotListSchema,
  parkingSpotsListInputSchema,
} from '#/features/parking-spots/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '#/lib/utils.ts';

export const getParkingSpotsForParking = createServerFn()
  .validator(parkingSpotsListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      page: data.page,
      limit: data.limit,
      parkingId: data.parkingId,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-spots?${searchParams.toString()}`,
      {},
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingSpotListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
