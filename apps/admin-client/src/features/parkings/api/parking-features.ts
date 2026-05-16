import { createServerFn } from '@tanstack/react-start';
import {
  createParkingFeatureInputSchema,
  createParkingFeatureResponseSchema,
  deleteParkingFeatureInputSchema,
  getParkingFeatureByIdInputSchema,
  parkingFeaturesListItemSchema,
  parkingFeaturesListSchema,
  parkingListBaseInputSchema,
  updateParkingFeatureInputSchema,
} from '#/features/parkings/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

/**
 * Fetches a list of parking features from the server based on the provided input data.
 *
 * @constant {Function} getParkingFeatures
 * @returns {Promise<Object>} Resolves with the validated list of parking features.
 * @throws {Error} Throws an error if the request fails or if the server response is invalid.
 */
export const getParkingFeatures = createServerFn()
  .inputValidator(parkingListBaseInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-features?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingFeaturesListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * A function for creating a new parking feature on the server.
 *
 * @returns {Promise<Object>} The validated parking feature data parsed from the server response.
 */
export const createParkingFeature = createServerFn()
  .inputValidator(createParkingFeatureInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/parking-features`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createParkingFeatureResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * Updates the details of a parking feature by making a PUT request to the server.
 *
 * @constant {Function} updateParkingFeature
 */
export const updateParkingFeature = createServerFn()
  .inputValidator(updateParkingFeatureInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parking-features/${data.parkingFeatureId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          levels: data.levels,
          version: data.version,
        }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createParkingFeatureResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * The `deleteParkingFeature` variable represents a server function designed to delete a specific parking feature.
 */
export const deleteParkingFeature = createServerFn()
  .inputValidator(deleteParkingFeatureInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ version: data.version });

    const response = await authFetch(
      `${env.SERVER_URL}/parking-features/${data.parkingFeatureId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      createParkingFeatureResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * Fetches a specific parking feature by its unique identifier.
 *
 * This function utilizes server-side logic to retrieve data about a parking feature
 * from the backend service. It validates the input against a predefined schema and
 * ensures the server's response is parsed and validated properly before returning
 * the data.
 *
 * - Input validation is performed using the `getParkingFeatureByIdInputSchema`.
 * - Server errors are handled using `genericApiErrorHandler`.
 * - The response is validated to confirm compliance with the `parkingFeaturesListItemSchema`.
 * - Throws an error if validation fails or if there's a server issue.
 *
 * @param {Object} data - The input data containing the unique identifier.
 * @param {string} data.parkingFeatureId - The unique identifier of the parking feature to fetch.
 * @throws {Error} Throws an error if the response is invalid or the fetching process fails.
 * @returns {Object} Returns the validated parking feature data.
 */
export const getParkingFeatureById = createServerFn()
  .inputValidator(getParkingFeatureByIdInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parking-features/${data.parkingFeatureId}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      parkingFeaturesListItemSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
