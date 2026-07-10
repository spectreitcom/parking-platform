import { createServerFn } from '@tanstack/react-start';
import {
  createCartInputSchema,
  genericCartResponseSchema,
  getCartInputSchema,
  getCartResponseSchema,
  updateCartInputSchema,
} from '#/features/cart/schemas';
import { authFetch, genericApiErrorHandler } from '#/lib/auth-fetch.ts';
import { parseJsonResponse } from '#/lib/api-response.ts';
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

    return parseJsonResponse(response, genericCartResponseSchema);
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

    return parseJsonResponse(response, genericCartResponseSchema);
  });

export const getCart = createServerFn()
  .validator(getCartInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/carts/${data.cartId}`, {
      method: 'GET',
    });

    await genericApiErrorHandler(response);

    return parseJsonResponse(response, getCartResponseSchema);
  });
