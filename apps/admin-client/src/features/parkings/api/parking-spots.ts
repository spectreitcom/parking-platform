import { createServerFn } from '@tanstack/react-start';
import {
  getParkingSpotsByParkingIdInputSchema,
  parkingSpotListSchema,
} from '#/features/parkings/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '#/lib/utils.ts';

/**
 * Retrieves a list of parking spots for the given parking ID.
 *
 * This function sends a request to the server to fetch parking spot details
 * associated with a specific parking ID. It validates the input data, handles
 * API errors, and ensures the response complies with the expected schema.
 *
 * The function performs the following steps:
 * - Validates the input using the provided schema.
 * - Constructs search parameters from the input data.
 * - Makes a GET request to the server to retrieve parking spot details.
 * - Handles potential API errors using a generic error handler.
 * - Validates the server response against a predefined schema.
 * - Returns the validated parking spot data.
 *
 * @constant {Function} getParkingSpotsByParkingId - Server function to fetch parking spot data.
 */
export const getParkingSpotsByParkingId = createServerFn()
  .inputValidator(getParkingSpotsByParkingIdInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      ...data,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-spots?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingSpotListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
