import { createServerFn } from '@tanstack/react-start';
import { getImageInputSchema } from '#/features/assets/schemas';
import { authFetch, genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const getImage = createServerFn()
  .validator(getImageInputSchema)
  .handler(async ({ data }) => {
    const url = new URL(`${env.SERVER_URL}/assets/${data.assetId}`);

    if (data.width) {
      url.searchParams.set('width', data.width.toString());
    }

    if (data.height) {
      url.searchParams.set('height', data.height.toString());
    }

    const response = await authFetch(url, {
      method: 'GET',
    });

    await genericApiErrorHandler(response, 'Failed to load image.');

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    return `data:${contentType};base64,${buffer.toString('base64')}`;
  });
