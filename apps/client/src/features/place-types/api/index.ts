import { createServerFn } from '@tanstack/react-start';
import {
  placeTypesListInputSchema,
  placeTypesListSchema,
} from '#/features/place-types/schemas';
import { createSearchParams } from '@repo/frontend-utils';
import { env } from '#/env.ts';
import { genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { parseJsonResponse } from '#/lib/api-response.ts';

export const getPlaceTypes = createServerFn()
  .validator(placeTypesListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      page: data.page,
      limit: data.limit,
      search: data.search ?? '',
    });

    const response = await fetch(
      `${env.SERVER_URL}/place-types?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    await genericApiErrorHandler(response);

    return parseJsonResponse(response, placeTypesListSchema);
  });
