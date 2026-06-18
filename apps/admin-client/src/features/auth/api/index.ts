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

export const signIn = createServerFn()
  .validator((payload: SignInSchema) => payload)
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

export const changePassword = createServerFn()
  .validator(changePasswordInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    await genericApiErrorHandler(response);
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
        body: JSON.stringify(data),
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
