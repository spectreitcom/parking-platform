import { createServerFn } from '@tanstack/react-start';
import {
  changePasswordInputSchema,
  getMeResponseSchema,
  requestResetPasswordInputSchema,
  resetPasswordInputSchema,
  signInResponseSchema,
} from '#/features/auth/schemas';
import type { SignInSchema } from '#/features/auth/schemas';
import { env } from '#/env.ts';
import { useAppSession } from '#/lib/session.ts';
import { redirect } from '@tanstack/react-router';
import { authFetch, genericApiErrorHandler } from '#/lib/auth-fetch.ts';

/**
 * The `signIn` function provides a server-side implementation of the sign-in process.
 * It validates the input payload, handles the sign-in logic by making an API request,
 * and processes the server response to securely update the user's session.
 *
 * Input:
 * - Expects an object conforming to the `SignInSchema` format, containing the `email` and `password` fields.
 *
 * Output:
 * - On success, updates the user's session with validated data from the server response
 *   and redirects to the homepage.
 * - Throws an error if the input validation fails, the API request fails, or the server response is invalid.
 *
 * Behavior:
 * - Sends a POST request to the authentication endpoint at `${env.SERVER_URL}/auth/sign-in`.
 * - Ensures the server response conforms to the `signInResponseSchema`.
 * - Updates the application session with the user's information retrieved from the server.
 * - Redirects the user to the root path `/` after successful sign-in.
 */
export const signIn = createServerFn()
  .inputValidator((payload: SignInSchema) => payload)
  .handler(async ({ data: { email, password } }) => {
    const response = await fetch(`${env.SERVER_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    await genericApiErrorHandler(response);

    const data = await response.json();

    const validationResult = signInResponseSchema.safeParse(data);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    const session = await useAppSession();

    await session.update({
      ...validationResult.data,
    });

    throw redirect({ to: '/app' });
  });

/**
 * Handles the user sign-out process by calling the server-side
 * sign-out endpoint and clearing the client's session data.
 *
 * This method performs the following actions:
 * - Sends a request to the server to sign out the authenticated user.
 * - Validates the server's response to ensure the operation succeeded.
 * - Clears the local session data to remove any stored authentication tokens.
 * - Redirects the user to the sign-in page upon successful sign-out.
 *
 * @throws {Error} If the server returns a non-successful response.
 * @throws {Redirect} Redirects the user to the sign-in page after sign-out.
 */
export const signOut = createServerFn().handler(async () => {
  const response = await authFetch(`${env.SERVER_URL}/auth/sign-out`, {
    method: 'POST',
  });

  await genericApiErrorHandler(response);

  const session = await useAppSession();
  await session.clear();

  throw redirect({ to: '/auth/sign-in' });
});

/**
 * Retrieves the authenticated user's information from the server.
 *
 * This function performs a request to the server's authentication
 * endpoint to fetch information about the current user. It validates
 * the server's response to ensure compliance with the defined schema.
 *
 * @throws {Error} If the server response is invalid or the data fails validation.
 * @throws {RedirectError} If the request is unauthorized (status 401), redirects to the sign-in page.
 *
 * @returns {Promise<Object>} A promise that resolves to the validated user data.
 */
export const getMe = createServerFn().handler(async () => {
  const response = await authFetch(`${env.SERVER_URL}/auth/me`, {
    method: 'GET',
  });

  await genericApiErrorHandler(response);

  const data = await response.json();

  const validationResult = getMeResponseSchema.safeParse(data);

  if (!validationResult.success) {
    throw new Error('Invalid response from server');
  }

  return validationResult.data;
});

/**
 * A server-side function to handle password change requests.
 *
 * The `changePassword` function validates the input data using the
 * `changePasswordInputSchema` and processes the password change request
 * by making an authenticated POST request to the server's `/auth/change-password` endpoint.
 *
 * On receiving a response, it utilizes a generic API error handler
 * to process any potential errors in the response.
 *
 * This function is intended for secure user password management operations.
 */
export const changePassword = createServerFn()
  .inputValidator(changePasswordInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    await genericApiErrorHandler(response);
  });

/**
 * A function used to initiate a password reset request for a user.
 * This function validates the provided input data, sends a POST request to the server
 * to request a reset password token, and processes the response.
 * Specifically, it ensures errors are handled using a generic API error handler.
 *
 * The server URL endpoint for the request is defined by the application configuration.
 *
 * The input data for this function is validated against a predefined schema.
 */
export const requestResetPassword = createServerFn()
  .inputValidator(requestResetPasswordInputSchema)
  .handler(async ({ data }) => {
    const response = await fetch(
      `${env.SERVER_URL}/auth/request-reset-password-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    await genericApiErrorHandler(response);
  });

/**
 * Function to handle resetting user passwords through a server-side operation.
 * This function uses an input validator to validate the input schema, then sends
 * a POST request with the provided data to the server's reset-password endpoint.
 * It also handles generic API errors that may occur during the operation.
 *
 * The `resetPassword` variable is initialized using a server function generator
 * and incorporates the following steps:
 * 1. Input validation using `resetPasswordInputSchema` to ensure required data is valid.
 * 2. Sending a request to reset the password via the server's API.
 * 3. Handling potential errors through a generic API error handler function.
 */
export const resetPassword = createServerFn()
  .inputValidator(resetPasswordInputSchema)
  .handler(async ({ data }) => {
    const response = await fetch(`${env.SERVER_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await genericApiErrorHandler(response);
  });
