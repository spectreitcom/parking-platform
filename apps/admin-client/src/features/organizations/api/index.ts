import { createServerFn } from '@tanstack/react-start';
import {
  addMemberToOrganizationInputSchema,
  createOrganizationInputSchema,
  getOrganizationForEditingInputSchema,
  organizationListItemSchema,
  organizationListSchema,
  organizationsListInputSchema,
  removeMemberFromOrganizationInputSchema,
  updateOrganizationInputSchema,
} from '#/features/organizations/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { genericResponseSchema } from '#/lib/schemas.ts';

/**
 * Retrieves a list of organizations based on the provided input parameters.
 *
 * The `getOrganizationsList` function fetches data from the server, validates the input and response,
 * and returns the list of organizations in a structured format. The function ensures integrity
 * by utilizing input schemas and response validation.
 *
 * Behavior:
 * - Validates input using the `organizationsListInputSchema`.
 * - Constructs query parameters from the input data.
 * - Sends a GET request to the server to fetch the list of organizations.
 * - Handles potential errors from the server using a generic API error handler.
 * - Validates server response against the `organizationListSchema`.
 *
 * Throws:
 * - `defaultServerError` if the server response does not match the expected schema.
 *
 * Returns:
 * - A validated list of organizations as per the `organizationListSchema`.
 */
export const getOrganizationsList = createServerFn()
  .inputValidator(organizationsListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      ...data,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/organizations?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = organizationListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * Handles the creation of a new organization by sending a POST request
 * to the server's organizations endpoint. This function validates the
 * input data, processes the server response, handles errors, and ensures
 * the server response adheres to the expected schema.
 *
 * The function uses `createServerFn` to define a server-side handler
 * with an associated input validation schema and asynchronous request logic.
 *
 * Input validation is performed using the `createOrganizationInputSchema`
 * to ensure the data complies with the expected structure and constraints.
 *
 * The handler sends the organization creation request to the server
 * and applies error handling routines to process potential server-side
 * issues using `genericApiErrorHandler`.
 *
 * Ensures the server response matches the predefined schema (`genericResponseSchema`)
 * before returning the processed response data. If validation fails, it raises
 * a default server error.
 *
 * @constant {Function} createOrganization The function to create a new organization.
 */
export const createOrganization = createServerFn()
  .inputValidator(createOrganizationInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/organizations`, {
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
 * Updates an organization's details on the server.
 *
 * This function performs an HTTP PUT request to update the specified organization's data.
 * It validates the input data using `updateOrganizationInputSchema` and validates
 * the server response using `genericResponseSchema`.
 *
 * Throws an error if the input validation fails, the server returns an error, or the response
 * validation fails.
 *
 * @constant {Function} updateOrganization
 * @throws {Error} Throws `defaultServerError` if the response validation fails.
 * @throws {Error} Throws an appropriate error if the server request fails or if any step in the
 * input/output validation pipeline is invalid.
 */
export const updateOrganization = createServerFn()
  .inputValidator(updateOrganizationInputSchema)
  .handler(async ({ data }) => {
    const { organizationId, ...rest } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${organizationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          ...rest,
        }),
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
 * Adds a member to an organization by making a POST request to the organization's API endpoint.
 *
 * This function validates the input data against a predefined schema and handles the API response.
 * It ensures the response data is valid and handles errors appropriately if the API call or validation fails.
 *
 * Input validation for the function is performed using `addMemberToOrganizationInputSchema`.
 *
 * @constant {ServerFunction} addMemberToOrganization
 * @throws {Error} Throws a default server error if the API response validation fails.
 */
export const addMemberToOrganization = createServerFn()
  .inputValidator(addMemberToOrganizationInputSchema)
  .handler(async ({ data }) => {
    const { organizationId, ...rest } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${organizationId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...rest,
        }),
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
 * Function to remove a member from an organization.
 *
 * This server-side function handles the process of removing a specific member
 * from a given organization by making a DELETE request to the server endpoint.
 * Validates input and server response to ensure consistency and error handling.
 *
 * Input validation is performed using `removeMemberFromOrganizationInputSchema`,
 * and the server response is validated against `genericResponseSchema`.
 *
 * Throws an error if the input or response validation fails, or if the request
 * encounters a server-side problem.
 *
 * @type {Function}
 */
export const removeMemberFromOrganization = createServerFn()
  .inputValidator(removeMemberFromOrganizationInputSchema)
  .handler(async ({ data }) => {
    const { organizationId, memberId, version } = data;

    const searchParams = createSearchParams({
      version,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${organizationId}/members/${memberId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
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
 * Fetches organization information for editing purposes.
 *
 * This function is responsible for retrieving the details of an organization
 * identified by the provided `organizationId`. The input is validated against
 * a predefined schema, and the response is processed to ensure it matches
 * the expected format. If any errors occur, appropriate error handling is
 * applied, including triggering a generic API error handler or throwing
 * a default server error.
 *
 * @type {function} getOrganization
 * @returns {Promise<object>} Returns the organization data if the process is successful.
 * @throws {Error} Throws an error if the input validation fails, API call fails,
 *                 or the response data does not match the expected schema.
 */
export const getOrganization = createServerFn()
  .inputValidator(getOrganizationForEditingInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${data.organizationId}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = organizationListItemSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
