import { createServerFn } from '@tanstack/react-start';
import {
  parkingDetailsInputSchema,
  parkingDetailsSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '@repo/frontend-utils';
import { env } from '#/env.ts';
import { genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { parseJsonResponse } from '#/lib/api-response.ts';

export const getParkingDetails = createServerFn()
  .validator(parkingDetailsInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      arrival: data.arrival,
      departure: data.departure,
    });

    const response = await fetch(
      `${env.SERVER_URL}/parkings/${data.parkingId}?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    await genericApiErrorHandler(response);

    return parseJsonResponse(response, parkingDetailsSchema);
  });
