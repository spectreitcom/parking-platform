import { createServerFn } from '@tanstack/react-start';
import {
  getOrganizationUserByIdInputSchema,
  organizationUserListItemSchema,
  organizationUserListSchema,
  organizationUsersListInputSchema,
} from '#/features/organization-users/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

/**
 * Fetches and returns a list of organization users from the server.
 *
 * This server function:
 * 1. Accepts validated input based on the `organizationUsersListInputSchema`.
 * 2. Constructs search parameters from the input data.
 * 3. Sends an authenticated `GET` request to the server to retrieve organization users.
 * 4. Handles API errors through a generic error handler.
 * 5. Validates the response data using the `organizationUserListSchema`.
 *
 * Throws an error if the validation fails or if a server error occurs.
 *
 * @constant {ServerFunction} getOrganizationUsers - The server function responsible for fetching organization users.
 */
export const getOrganizationUsers = createServerFn()
  .inputValidator(organizationUsersListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      ...data,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/organization-users?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = organizationUserListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

/**
 * A function for retrieving the information of an organization user by their identifier.
 * This server function is configured with an input validator and a handler for processing
 * the request to fetch organization user data from the server.
 *
 * Input Validation:
 * The input is validated using the `getOrganizationUserByIdInputSchema` to ensure the
 * required properties and data structure are provided.
 *
 * Handler Logic:
 * 1. Sends a GET request to the server to fetch organization user data based on the provided user ID.
 * 2. Handles server responses and checks for errors using a generic API error handler.
 * 3. Parses and validates the server response against the `organizationUserListItemSchema`.
 * 4. Throws a default server error if the validation fails.
 */
export const getOrganizationUser = createServerFn()
  .inputValidator(getOrganizationUserByIdInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/organization-users/${data.organizationUserId}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      organizationUserListItemSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
