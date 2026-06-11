import { useAppSession } from '#/lib/session.ts';
import { createServerFn } from '@tanstack/react-start';
import {
  refreshTokenSchema,
  signInResponseSchema,
} from '#/features/auth/schemas';
import { env } from '#/env.ts';
import { redirect } from '@tanstack/react-router';
import { apiErrorSchema } from '#/lib/schemas.ts';

type FetchParameter = Parameters<typeof fetch>;

export const defaultServerError = new Error(
  'Something went wrong. Please try again later.',
);

const refreshToken = createServerFn()
  .inputValidator(refreshTokenSchema)
  .handler(async ({ data }) => {
    const response = await fetch(`${env.SERVER_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const session = await useAppSession();

    if (!response.ok) {
      await session.clear();
      throw redirect({ to: '/auth/sign-in' });
    }

    const responseData = await response.json();

    const validationResult = signInResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    await session.update({
      ...validationResult.data,
    });

    return validationResult.data;
  });

export const authFetch = async (...args: FetchParameter) => {
  const session = await useAppSession();

  const apiOrigin = new URL(env.SERVER_URL).origin;
  const shouldAttachAuthHeader = apiOrigin === env.SERVER_ORIGIN;

  const response = await fetch(args[0], {
    ...args[1],
    headers: {
      'Content-Type': 'application/json',
      ...(shouldAttachAuthHeader && {
        Authorization: `Bearer ${session.data.accessToken ?? ''}`,
      }),
      ...args[1]?.headers,
    },
  });

  if (!response.ok && response.status === 401) {
    const { accessToken } = await refreshToken({
      data: {
        refreshToken: session.data.refreshToken ?? undefined,
      },
    });
    return await fetch(args[0], {
      ...args[1],
      headers: {
        'Content-Type': 'application/json',
        ...(shouldAttachAuthHeader && {
          Authorization: `Bearer ${accessToken}`,
        }),
        ...args[1]?.headers,
      },
    });
  }

  return response;
};

export async function genericApiErrorHandler(
  response: Response,
  fallbackMessage = 'Something went wrong. Please try again later.',
) {
  if (!response.ok) {
    if (response.status === 401) {
      throw redirect({ to: '/auth/sign-in' });
    }

    let error: unknown;
    try {
      error = await response.json();
    } catch {
      throw new Error(fallbackMessage);
    }

    const validationSchema = apiErrorSchema.safeParse(error);

    if (!validationSchema.success) {
      throw new Error(fallbackMessage);
    }

    throw new Error(validationSchema.data.detail);
  }
}
