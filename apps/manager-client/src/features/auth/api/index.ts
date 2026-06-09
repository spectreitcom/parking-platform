import { createServerFn } from '@tanstack/react-start';
import {
  changePasswordInputSchema,
  getMeResponseSchema,
  requestResetPasswordInputSchema,
  resetPasswordInputSchema,
  signInResponseSchema,
  signInSchema,
} from '#/features/auth/schemas';
import { env } from '#/env.ts';
import { authFetch, genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { useAppSession } from '#/lib/session.ts';
import { redirect } from '@tanstack/react-router';

/**
 * The `signIn` variable is a server function used to authenticate a user by sending
 * a POST request to the server with the user's email and password. It validates the input
 * against a predefined schema, handles API errors, parses the server's response, and updates
 * the session with the user's authentication data.
 *
 * It follows a structured flow:
 * - Validates the input using `signInSchema`.
 * - Sends the input to the server's authentication endpoint.
 * - Handles server responses, including errors, and validates the returned data against
 *   `signInResponseSchema`.
 * - Updates the current user session with the parsed authentication data.
 */
export const signIn = createServerFn()
  .inputValidator(signInSchema)
  .handler(async ({ data }) => {
    const response = await fetch(`${env.SERVER_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    await genericApiErrorHandler(response);

    const dataResponse = await response.json();

    const validationResult = signInResponseSchema.safeParse(dataResponse);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    const session = await useAppSession();

    await session.update({
      ...validationResult.data,
    });
  });

/**
 * Handles the sign-out functionality for the application.
 *
 * This function sends a POST request to the sign-out endpoint of the authentication server.
 * It handles potential API errors and ensures that the user's session data is cleared upon
 * successful sign-out. After clearing the session, the user is redirected to the sign-in page.
 *
 * The function is intended to be used as a server-side handler and should ensure secure
 * execution of the sign-out process.
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
 * Retrieves the current authenticated user's information from the server.
 *
 * This function sends a request to the server's authentication endpoint to fetch
 * user details. It validates the incoming response against a predefined schema
 * and throws an error if the response is invalid.
 *
 * @constant {Function} getMe - Asynchronous handler for fetching authenticated user data.
 * @throws {Error} Throws an error if the response from the server is invalid.
 * @returns {Promise<Object>} A promise that resolves to the validated user data.
 */
export const getMe = createServerFn().handler(async () => {
  const response = await authFetch(`${env.SERVER_URL}/auth/me`);

  await genericApiErrorHandler(response);

  const data = await response.json();

  const validationResult = getMeResponseSchema.safeParse(data);

  if (!validationResult.success) {
    throw new Error('Invalid response from server');
  }

  return validationResult.data;
});

/**
 * This variable represents a server function responsible for handling password reset requests.
 * It validates the input using the specified schema and processes the request asynchronously by
 * making an HTTP POST call to the reset password endpoint.
 *
 * The purpose of this function is to initiate the process of requesting a reset password token
 * by communicating with the authentication service.
 *
 * - Input validation is performed using `requestResetPasswordInputSchema`.
 * - Sends a POST request with the provided data in JSON format to the authentication server.
 * - Handles potential API errors through a generic error handler.
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
        body: JSON.stringify({ ...data }),
      },
    );

    await genericApiErrorHandler(response);
  });

/**
 * A server function to handle the password reset process. This function is configured with an input
 * validator to ensure the input adheres to the schema defined by `resetPasswordInputSchema`, and it
 * executes the password reset operation by sending an HTTP POST request to the specified server URL.
 *
 * The function interacts with the authentication service to reset the user's password. It sends
 * the password reset data to the server endpoint defined at `${env.SERVER_URL}/auth/reset-password`.
 * In the event of an error, the function utilizes a generic API error handler to process and handle
 * any errors returned by the server.
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

export const changePassword = createServerFn()
  .inputValidator(changePasswordInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({
        existingPassword: data.existingPassword,
        newPassword: data.newPassword,
      }),
    });

    await genericApiErrorHandler(response);
  });
