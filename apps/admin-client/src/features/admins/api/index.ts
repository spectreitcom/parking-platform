import { createServerFn } from '@tanstack/react-start';
import {
  adminListInputSchema,
  adminsListSchema,
} from '#/features/admins/schemas';
import type { AdminListInputSchema } from '#/features/admins/schemas';
import { authFetch } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '#/lib/utils.ts';

/**
 * Retrieves a list of admin users from the server.
 *
 * This function uses a server-side endpoint to fetch admin data based on the provided input,
 * validates the input and response using predefined schemas, and returns the validated list of admins.
 *
 * The function encapsulates:
 * - Input validation using `adminListInputSchema` to ensure the input complies with expected structure.
 * - A handler that sends a GET request to the server to fetch admin data.
 * - Response validation using `adminsListSchema` to ensure the server's response data matches the expected structure.
 *
 * @constant {Function} getAdminsList
 * @throws {Error} Throws validation errors if the input or response data is invalid, or if the server request fails.
 */
export const getAdminsList = createServerFn()
  .inputValidator((input: AdminListInputSchema) => {
    const validationResult = adminListInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new Error(validationResult.error.message);
    }
    return validationResult.data;
  })
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      ...data,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/admins?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch admins');
    }

    const responseData = await response.json();

    const validationResult = adminsListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });
