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

export const signIn = createServerFn()
  .validator(signInSchema)
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

export const signOut = createServerFn().handler(async () => {
  const response = await authFetch(`${env.SERVER_URL}/auth/sign-out`, {
    method: 'POST',
  });

  await genericApiErrorHandler(response);

  const session = await useAppSession();
  await session.clear();

  throw redirect({ to: '/auth/sign-in' });
});

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

export const requestResetPassword = createServerFn()
  .validator(requestResetPasswordInputSchema)
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

export const resetPassword = createServerFn()
  .validator(resetPasswordInputSchema)
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
  .validator(changePasswordInputSchema)
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
