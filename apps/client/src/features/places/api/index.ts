import { createServerFn } from '@tanstack/react-start';
import {
  placeDetailsInputSchema,
  placesListInputSchema,
  placesListItemSchema,
  placesListSchema,
} from '#/features/places/schemas';
import { createSearchParams } from '@repo/frontend-utils';
import { env } from '#/env.ts';
import {
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';

export const getPlaces = createServerFn()
  .validator(placesListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      page: data.page,
      limit: data.limit,
      search: data.search ?? '',
      placeTypeId: data.placeTypeId ?? '',
    });

    const response = await fetch(
      `${env.SERVER_URL}/places?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = placesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getPlaceDetails = createServerFn()
  .validator(placeDetailsInputSchema)
  .handler(async ({ data }) => {
    const response = await fetch(`${env.SERVER_URL}/places/${data.placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = placesListItemSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
