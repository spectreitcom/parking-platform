import { createServerFn } from '@tanstack/react-start';
import {
  parkingListBaseInputSchema,
  parkingListSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import { authFetch } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

/**
 * Retrieves a list of parking spaces based on the provided input parameters.
 *
 * This function uses an input validator to ensure the input adheres to the predefined schema,
 * constructs the necessary search parameters, sends a GET request to the server to fetch
 * the list of parking spaces, validates the response data, and returns the validated list.
 *
 * @variable {Function} getParkingList - The function to fetch parking data.
 *
 * @throws {Error} Throws an error if the server request fails or the response data
 *                 does not pass validation.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to a validated array of parking
 *                                   objects from the server.
 */
export const getParkingList = createServerFn()
  .inputValidator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

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
