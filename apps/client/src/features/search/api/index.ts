import { createServerFn } from '@tanstack/react-start';
import {
  searchInputSchema,
  searchResultsSchema,
} from '#/features/search/schemas';
import { createSearchParams } from '@repo/frontend-utils';
import { env } from '#/env.ts';
import { genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { parseJsonResponse } from '#/lib/api-response.ts';

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

    return parseJsonResponse(response, searchResultsSchema);
  });
