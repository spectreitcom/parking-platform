import { createServerFn } from '@tanstack/react-start';
import {
  addMemberToOrganizationInputSchema,
  createOrganizationInputSchema,
  getOrganizationForEditingInputSchema,
  organizationListItemSchema,
  organizationListSchema,
  organizationsListInputSchema,
  removeMemberFromOrganizationInputSchema,
  searchedOrganizationUsersResponseSchema,
  searchOrganizationUsersInputSchema,
  updateOrganizationInputSchema,
} from '#/features/organizations/schemas';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { genericResponseSchema } from '#/lib/schemas.ts';
import { createSearchParams } from '@repo/frontend-utils';

export const getOrganizationsList = createServerFn()
  .validator(organizationsListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      ...data,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/organizations?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = organizationListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const createOrganization = createServerFn()
  .validator(createOrganizationInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/organizations`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    });

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const updateOrganization = createServerFn()
  .validator(updateOrganizationInputSchema)
  .handler(async ({ data }) => {
    const { organizationId, ...rest } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${organizationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          ...rest,
        }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const addMemberToOrganization = createServerFn()
  .validator(addMemberToOrganizationInputSchema)
  .handler(async ({ data }) => {
    const { organizationId, ...rest } = data;

    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${organizationId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...rest,
        }),
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const removeMemberFromOrganization = createServerFn()
  .validator(removeMemberFromOrganizationInputSchema)
  .handler(async ({ data }) => {
    const { organizationId, memberId, version } = data;

    const searchParams = createSearchParams({
      version,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${organizationId}/members/${memberId}?${searchParams.toString()}`,
      {
        method: 'DELETE',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = genericResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getOrganization = createServerFn()
  .validator(getOrganizationForEditingInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/organizations/${data.organizationId}`,
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = organizationListItemSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const searchOrganizationUsers = createServerFn()
  .validator(searchOrganizationUsersInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({ ...data });

    const response = await authFetch(
      `${env.SERVER_URL}/organizations/users/search?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      searchedOrganizationUsersResponseSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });
