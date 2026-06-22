import { createServerFn } from '@tanstack/react-start';
import {
  adminListInputSchema,
  adminsListSchema,
} from '#/features/admins/schemas';
import type { AdminListInputSchema } from '#/features/admins/schemas';
import { authFetch, genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { createSearchParams } from '@repo/frontend-utils';

export const getAdminsList = createServerFn()
  .validator((input: AdminListInputSchema) => {
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

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = adminsListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw new Error('Invalid response from server');
    }

    return validationResult.data;
  });
