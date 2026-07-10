import { createServerFn } from '@tanstack/react-start';
import { env } from '#/env.ts';
import { genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { parseJsonResponse } from '#/lib/api-response.ts';
import { featureListSchema } from '#/features/features/schemas';

export const getFeatures = createServerFn().handler(async () => {
  const response = await fetch(`${env.SERVER_URL}/features`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await genericApiErrorHandler(response);

  return parseJsonResponse(response, featureListSchema);
});
