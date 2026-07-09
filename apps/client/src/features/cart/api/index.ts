import { createServerFn } from '@tanstack/react-start';
import {
  createCartInputSchema,
  genericCartResponseSchema,
  getCartInputSchema,
  getCartResponseSchema,
  updateCartInputSchema,
} from '#/features/cart/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';

export const createCart = createServerFn()
  .validator(createCartInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/carts`, {
      method: 'POST',
      body: JSON.stringify({
        parkingSpotId: data.parkingSpotId,
        arrival: data.arrival,
        departure: data.departure,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericCartResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const updateCart = createServerFn()
  .validator(updateCartInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/carts/${data.cartId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        arrival: data.arrival,
        departure: data.departure,
        addonIds: data.addonIds,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericCartResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getCart = createServerFn()
  .validator(getCartInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/carts/${data.cartId}`, {
      method: 'GET',
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = getCartResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
