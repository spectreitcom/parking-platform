import { createServerFn } from '@tanstack/react-start';
import { env } from '#/env.ts';
import {
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { featureListSchema } from '#/features/features/schemas';

export const getFeatures = createServerFn().handler(async () => {
  const response = await fetch(`${env.SERVER_URL}/features`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await genericApiErrorHandler(response);

  const responseData = await response.json();

  const validationResult = featureListSchema.safeParse(responseData);

  if (!validationResult.success) {
    throw defaultServerError;
  }

  return validationResult.data;
});
