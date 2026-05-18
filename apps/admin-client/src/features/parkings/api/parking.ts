import { createServerFn } from '@tanstack/react-start';
import {
  createParkingInputSchema,
  parkingListBaseInputSchema,
  parkingListSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { genericResponseSchema } from '#/lib/schemas.ts';

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

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * Function to create a new parking entry on the server.
 *
 * This function initializes a server-side operation to send a POST request
 * to the parking endpoint. It performs input validation, communicates with
 * the server, handles errors, and validates the response data. If the response
 * doesn't meet the expected schema, a default server error is thrown.
 *
 * Developers should ensure that the input schema provided to the function
 * matches the expected structure for parking creation.
 *
 * Errors are handled using the genericApiErrorHandler utility, and the parsed
 * response must conform to the genericResponseSchema for successful execution.
 */
export const createParking = createServerFn()
  .inputValidator(createParkingInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/parkings`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
