import { createServerFn } from '@tanstack/react-start';
import {
  activatePlaceInputSchema,
  createPlaceInputSchema,
  getPlaceForEditingInputSchema,
  getPlaceForEditingResponseSchema,
  placesListBaseInputSchema,
  placesListSchema,
  updatePlaceInputSchema,
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
 * Retrieves a list of places from the server based on the provided input parameters.
 *
 * The `getPlacesList` function sends a GET request to the server's `/places` endpoint with the
 * query parameters derived from the input. The response is validated against a schema to ensure
 * data integrity before being returned. If the validation fails or an API error occurs,
 * appropriate error handling is executed.
 *
 * Input validation is performed using the `placesListBaseInputSchema` schema, ensuring that only valid
 * input is sent to the server. The resulting list of places is validated using the `placesListSchema`.
 *
 * Throws an error if the response does not pass schema validation or if a server-related error occurs.
 */
export const getPlacesList = createServerFn()
  .inputValidator(placesListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/places?${searchParams.toString()}`,
      { method: 'GET' },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = placesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * Creates a new place by sending a POST request to the server with the provided data.
 *
 * This function uses input validation and error handling to ensure the integrity of the
 * request and response. It validates the input using `createPlaceInputSchema`, sends the
 * data to the server, and processes the response. If the response does not conform to the
 * expected schema, an error is thrown.
 *
 * The function performs the following:
 * - Validates the input data.
 * - Sends an authenticated POST request to the server's `/places` endpoint.
 * - Handles errors using a generic API error handler.
 * - Parses and validates the server response against a predefined schema (`genericResponseSchema`).
 * - Throws an error if the response validation fails.
 * - Returns the validated response data upon success.
 */
export const createPlace = createServerFn()
  .inputValidator(createPlaceInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/places`, {
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

/**
 * Updates a specific place resource with provided information.
 *
 * This function utilizes a server-side handler to update data for a specific place identified by `placeId`.
 * It validates the input against a predefined schema and handles API responses, ensuring data integrity
 * and error management.
 *
 * The handler performs the following tasks:
 * - Extracts `placeId` and other relevant data from the input.
 * - Sends a PUT request to update the place resource on the server.
 * - Handles server-side errors through a generic error handler.
 * - Validates the API response against a predefined response schema.
 * - Throws an error if the response data fails validation.
 *
 * Returns the validated response data upon successful execution.
 */
export const updatePlace = createServerFn()
  .inputValidator(updatePlaceInputSchema)
  .handler(async ({ data }) => {
    const { placeId, ...restData } = data;
    const response = await authFetch(`${env.SERVER_URL}/places/${placeId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...restData }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * A server function for activating a place by sending a POST request to the server endpoint.
 *
 * The function utilizes an input validation schema to validate the input data before proceeding.
 * It then constructs a request to the server using the provided `placeId` along with additional data.
 *
 * Upon receiving a response, the function ensures proper error handling via a generic API error handler
 * and validates the server's response against a specified response schema. If the response schema validation fails,
 * an error is thrown.
 *
 * @param {Object} input - The input data used for the activation process.
 * @param {string} input.placeId - The unique identifier of the place being activated.
 * @param {Object} input.restData - Additional data required for the activation request.
 * @throws {Error} Throws an error if server validation or input validation fails.
 * @returns {Promise<Object>} A promise that resolves to the validated response data from the server.
 */
export const activatePlace = createServerFn()
  .inputValidator(activatePlaceInputSchema)
  .handler(async ({ data }) => {
    const { placeId, ...restData } = data;
    const response = await authFetch(
      `${env.SERVER_URL}/places/${placeId}/activate`,
      {
        method: 'POST',
        body: JSON.stringify({ ...restData }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * A server function for deactivating a specific place.
 *
 * This function communicates with the backend server to deactivate a place
 * identified by its placeId. It validates the input data against a predefined schema,
 * sends a POST request to the server with the required data, and processes the
 * server's response.
 *
 * Input data must match the `activatePlaceInputSchema` schema.
 *
 * The function performs the following steps:
 * 1. Extracts `placeId` and other relevant data from the input.
 * 2. Sends a POST request to the backend endpoint to initiate the deactivation process.
 * 3. Handles potential API errors using a generic error handler.
 * 4. Parses and validates the response using `genericResponseSchema`.
 * 5. Throws a default server error if the response validation fails.
 * 6. Returns the validated response data on success.
 *
 * @constant
 */
export const deactivatePlace = createServerFn()
  .inputValidator(activatePlaceInputSchema)
  .handler(async ({ data }) => {
    const { placeId, ...restData } = data;
    const response = await authFetch(
      `${env.SERVER_URL}/places/${placeId}/deactivate`,
      {
        method: 'POST',
        body: JSON.stringify({ ...restData }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * Fetches and returns place details for editing purposes.
 * This function validates the input data, performs an authenticated fetch
 * request to retrieve place information, and validates the server response
 * against a predefined schema. If the validation fails, an error is thrown.
 *
 * The function should only be used server-side as it relies on server-side
 * configurations and authentication mechanisms.
 *
 * @constant {Function} getPlaceForEditing
 * @returns {Promise<Object>} A promise that resolves to the validated place
 * details object retrieved from the server.
 * @throws {Error} Throws an error if the response validation fails or if
 * a server error occurs.
 */
export const getPlaceForEditing = createServerFn()
  .inputValidator(getPlaceForEditingInputSchema)
  .handler(async ({ data }) => {
    const { placeId } = data;

    const response = await authFetch(`${env.SERVER_URL}/places/${placeId}`, {
      method: 'GET',
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      getPlaceForEditingResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
