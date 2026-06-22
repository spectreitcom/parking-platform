import { createServerFn } from '@tanstack/react-start';
import {
  parkingFeatureListSchema,
  parkingFeaturesListInputSchema,
} from '#/features/parking-features/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '@repo/frontend-utils';

export const getParkingFeatures = createServerFn()
  .validator(parkingFeaturesListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      page: data.page,
      limit: data.limit,
      search: data.search ?? '',
      levels: data.levels ?? [],
    });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-features?${searchParams.toString()}`,
      {},
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingFeatureListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
