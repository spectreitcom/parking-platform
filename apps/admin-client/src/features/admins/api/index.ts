import { createServerFn } from '@tanstack/react-start';
import {
  adminListInputSchema,
  adminsListSchema,
} from '#/features/admins/schemas';
import type { AdminListInputSchema } from '#/features/admins/schemas';
import { authFetch } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const getAdminsList = createServerFn()
  .inputValidator((input: AdminListInputSchema) => {
    const validationResult = adminListInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new Error(validationResult.error.message);
    }
    return validationResult.data;
  })
  .handler(async ({ data }) => {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(data)) {
      if (value) {
        searchParams.append(key, value.toString());
      }
    }

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
