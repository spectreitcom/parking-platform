import { createServerFn } from '@tanstack/react-start';
import {
  searchInputSchema,
  searchResultsSchema,
} from '#/features/search/schemas';
import { createSearchParams } from '@repo/frontend-utils';
import { env } from '#/env.ts';
import {
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';

export const search = createServerFn()
  .validator(searchInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      placeId: data.placeId,
      arrival: data.arrival,
      departure: data.departure,
      featureIds: data.featureIds ?? [],
    });

    const response = await fetch(`${env.SERVER_URL}/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = searchResultsSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
