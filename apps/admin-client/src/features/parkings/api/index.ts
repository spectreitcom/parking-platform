import { createServerFn } from '@tanstack/react-start';
import {
  parkingListInputSchema,
  parkingListSchema,
} from '#/features/parkings/schemas';
import { authFetch } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const getParkingList = createServerFn()
  .inputValidator(parkingListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(data)) {
      if (value) {
        searchParams.append(key, value.toString());
      }
    }

    const response = await authFetch(
      `${env.SERVER_URL}/parkings?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch parking list');
    }

    const responseData = await response.json();

    const validationResult = parkingListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });
