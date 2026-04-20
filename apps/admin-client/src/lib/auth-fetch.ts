import { useAppSession } from '#/lib/session.ts';
import { createServerFn } from '@tanstack/react-start';
import {
  refreshTokenSchema,
  signInResponseSchema,
} from '#/features/auth/schemas';
import type { RefreshTokenSchema } from '#/features/auth/schemas';
import { env } from '#/env.ts';
import { redirect } from '@tanstack/react-router';

type FetchParameter = Parameters<typeof fetch>;

const refreshToken = createServerFn()
  .inputValidator((data: RefreshTokenSchema) => {
    const validationResult = refreshTokenSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(validationResult.error.message);
    }
    return validationResult.data;
  })
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
      throw new Error('Invalid refresh token response');
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
        refreshToken: session.data.refreshToken ?? '',
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
