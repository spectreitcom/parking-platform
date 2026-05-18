import { createServerFn } from '@tanstack/react-start';
import {
  activateAndDeactivateParkingInputSchema,
  createParkingInputSchema,
  getParkingDetailsInputSchema,
  parkingDetailsSchema,
  parkingListBaseInputSchema,
  parkingListSchema,
  updateParkingInputSchema,
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

/**
 * Fetches detailed information about a specific parking location from the server.
 *
 * This function is designed to interact with a backend API to retrieve parking details
 * for a given parking ID. The parking ID is validated using a schema before making the
 * request. Upon receiving a response, the data is validated to ensure it conforms to
 * the expected schema. If any validation or server-side errors occur, appropriate
 * error handling is executed.
 *
 * @param {Object} data - The input data containing parameters for the function.
 * @param {string} data.parkingId - The unique identifier for the parking location to fetch details.
 * @returns {Promise<Object>} A promise that resolves to the validated parking details from the server.
 * @throws {Error} Throws an error if the server response is invalid or doesn't pass validation.
 */
export const getParkingDetails = createServerFn()
  .inputValidator(getParkingDetailsInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${data.parkingId}`,
      { method: 'GET' },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = parkingDetailsSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * Updates parking details on the server.
 *
 * This function is used to send an update request to the server for a specific parking resource, identified by its `parkingId`.
 * The function validates the input data and ensures the server response adheres to the expected schema.
 * If the validation fails at any stage or an API error occurs, appropriate error handling is performed.
 *
 * Input constraints and structure are enforced using `updateParkingInputSchema`. The server endpoint is constructed
 * dynamically using the provided parking ID, and the payload includes the additional data needed for the update.
 *
 * Errors:
 * - Throws `defaultServerError` if the server's response does not pass the expected schema validation.
 * - Invokes `genericApiErrorHandler` to handle common API-related errors.
 *
 * @constant
 */
export const updateParking = createServerFn()
  .inputValidator(updateParkingInputSchema)
  .handler(async ({ data }) => {
    const { parkingId, ...rest } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${parkingId}`,
      { method: 'PUT', body: JSON.stringify({ ...rest }) },
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
 * Activates a parking spot on the server.
 *
 * This function sends a request to activate a parking spot using the given
 * parking ID and version. It validates the input using the defined schema,
 * performs the API call, handles potential errors, and ensures the response
 * is valid according to the response schema.
 *
 * The process includes:
 * - Validation of input data.
 * - Sending a POST request to the parking activation endpoint.
 * - Handling generic API errors if they occur.
 * - Parsing and validating the server's response.
 *
 * @const {Function} activateParking
 * @throws {Error} Throws an error if the response validation fails or if an unexpected error occurs during the process.
 * @returns {Object} A parsed and validated response from the server.
 */
export const activateParking = createServerFn()
  .inputValidator(activateAndDeactivateParkingInputSchema)
  .handler(async ({ data }) => {
    const { parkingId, version } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${parkingId}/activate`,
      { method: 'POST', body: JSON.stringify({ version }) },
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
 * A server function responsible for deactivating a parking spot.
 *
 * This function validates input data against the `activateAndDeactivateParkingInputSchema`
 * and performs a secure API call to deactivate a parking spot identified by the given
 * `parkingId`. It also ensures adherence to the API versioning mechanism by requiring the
 * `version` parameter.
 *
 * The function handles errors through `genericApiErrorHandler` and validates
 * the API response against the `genericResponseSchema`. It throws an error
 * if the schema validation fails or if a server error occurs.
 *
 * @constant {Function} deactivateParking
 */
export const deactivateParking = createServerFn()
  .inputValidator(activateAndDeactivateParkingInputSchema)
  .handler(async ({ data }) => {
    const { parkingId, version } = data;
    const response = await authFetch(
      `${env.SERVER_URL}/parkings/${parkingId}/deactivate`,
      { method: 'POST', body: JSON.stringify({ version }) },
    );
    await genericApiErrorHandler(response);
    const responseData = await response.json();
    const validationResult = genericResponseSchema.safeParse(responseData);
    if (!validationResult.success) {
      throw defaultServerError;
    }
    return validationResult.data;
  });
