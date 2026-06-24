import { createServerFn } from '@tanstack/react-start';
import {
  getImageInputSchema,
  uploadImageInputSchema,
  uploadImageResponseSchema,
} from '#/features/assets/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const uploadImage = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (data instanceof FormData) {
      return data;
    }
    return uploadImageInputSchema.parse(data);
  })
  .handler(async ({ data }) => {
    const formData = data instanceof FormData ? data : new FormData();

    if (!(data instanceof FormData)) {
      formData.append('file', (data as { file: File }).file);
    }

    const response = await authFetch(`${env.SERVER_URL}/assets/upload-image`, {
      method: 'POST',
      body: formData,
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = uploadImageResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

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
