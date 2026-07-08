import { createServerFn } from '@tanstack/react-start';
import {
  placeTypesListInputSchema,
  placeTypesListSchema,
} from '#/features/place-types/schemas';
import { createSearchParams } from '@repo/frontend-utils';
import { env } from '#/env.ts';
import {
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';

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

    const responseData = await response.json();

    const validationResult = placeTypesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
