import { createServerFn } from '@tanstack/react-start';
import {
  parkingListBaseInputSchema,
  parkingListSchema,
} from '#/features/parking/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

/**
 * Retrieves a list of parking data from the server based on the provided input parameters.
 * Uses schema validation for input and response to ensure data integrity.
 *
 * The function performs the following operations:
 * - Validates input data against the `parkingListBaseInputSchema`.
 * - Constructs query parameters using the provided input data.
 * - Sends an authenticated fetch request to retrieve parking data from the server.
 * - Handles potential API errors using a generic error handler.
 * - Validates the server's response data against the `parkingListSchema`.
 * - Throws a default server error if validation of the response data fails.
 * - Returns the validated parking data if all checks pass.
 *
 * @constant {Function} getParkings A server function to retrieve parking data.
 * @throws {Error} Throws an error if the server response validation fails.
 * @returns {Promise<Object>} A promise that resolves with the validated parking data.
 */
export const getParkings = createServerFn()
  .validator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/parkings?${searchParams.toString()}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
