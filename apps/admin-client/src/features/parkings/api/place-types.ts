import { createServerFn } from '@tanstack/react-start';
import {
  createPlaceTypeInputSchema,
  createPlaceTypeResponseSchema,
  deletePlaceTypeInputSchema,
  parkingListBaseInputSchema,
  placeTypesListSchema,
  updatePlaceTypeInputSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import { authFetch, genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

/**
 * Fetches a list of place types from the server based on the provided input data.
 *
 * This function uses a server-side handler to validate input, perform an authenticated
 * fetch request to retrieve place types, and validate the server's response against
 * the expected schema. If the server response is invalid or the request fails, an error
 * is thrown.
 *
 * The input provided to this function must adhere to the `parkingListBaseInputSchema`.
 * The returned data will conform to the structure defined in the `placeTypesListSchema`.
 *
 * @constant {Function} getPlaceTypes
 * @returns {Promise<Array>} Resolves with the validated list of place types.
 * @throws {Error} Throws an error if the request fails or if the server response is invalid.
 */
export const getPlaceTypes = createServerFn()
  .inputValidator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/place-types?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = placeTypesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });

/**
 * A function for creating a new place type on the server.
 *
 * This function utilizes a server-side handler to send a `POST` request
 * to the provided server URL for creating a place type resource. Input validation
 * is performed using a predefined schema, and the response from the server
 * is validated to ensure data integrity.
 *
 * Input Schema:
 * - Validates the input payload using `createPlaceTypeInputSchema`.
 *
 * Response:
 * - The server response is validated using `createPlaceTypeResponseSchema`
 *   to ensure it matches the expected structure.
 *
 * Errors:
 * - Throws an error if the HTTP request fails, or if the server response
 *   is invalid according to the response schema.
 *
 * Dependencies:
 * - `authFetch`: Utility function for sending authenticated HTTP requests.
 * - `env.SERVER_URL`: Environment variable containing the server base URL.
 * - `createPlaceTypeInputSchema`: Schema for validating input data.
 * - `createPlaceTypeResponseSchema`: Schema for validating the server response.
 *
 * Returns:
 * - The validated place type data parsed from the server response.
 */
export const createPlaceType = createServerFn()
  .inputValidator(createPlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/place-types`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });

/**
 * Updates the details of a place type by making a PUT request to the server.
 *
 * The `updatePlaceType` function validates its input using the `updatePlaceTypeInputSchema`
 * and processes the request using the provided handler. It sends an authenticated request
 * to update the specified place type with a new name and version. The server's response is
 * validated against the `createPlaceTypeResponseSchema`.
 *
 * Throws an error if the server request fails or the server response is invalid.
 *
 * @constant {Function} updatePlaceType
 */
export const updatePlaceType = createServerFn()
  .inputValidator(updatePlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/place-types/${data.placeTypeId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          version: data.version,
        }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Failed to update place type');
    }

    return validationResult.data;
  });

/**
 * The `deletePlaceType` variable represents a server function designed to delete a specific place type.
 * It validates the input data, sends an authenticated DELETE request to the server, and validates the server's response.
 *
 * The input data must conform to the `deletePlaceTypeInputSchema`, which is used to ensure the data structure is correct.
 *
 * The function executes the following steps:
 * 1. Constructs query parameters using the `version` provided in the input data.
 * 2. Sends a DELETE request to the server endpoint for the specified place type ID, along with the query parameters.
 * 3. Checks if the server's response indicates success. In case of failure, it throws an error.
 * 4. Parses and validates the server's response using the `createPlaceTypeResponseSchema` to ensure the response format is correct.
 * 5. Returns the validated response data when the process is completed successfully.
 *
 * Throws:
 * - An error if the DELETE request fails or the response indicates failure.
 * - An error if the server's response does not match the expected structure.
 *
 * Dependencies:
 * - `deletePlaceTypeInputSchema` for input validation.
 * - `createSearchParams` for constructing query parameters.
 * - `authFetch` for executing the authenticated server request.
 * - `env.SERVER_URL` for the base server URL.
 * - `createPlaceTypeResponseSchema` for response validation.
 */
export const deletePlaceType = createServerFn()
  .inputValidator(deletePlaceTypeInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ version: data.version });

    const response = await authFetch(
      `${env.SERVER_URL}/place-types/${data.placeTypeId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createPlaceTypeResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });
