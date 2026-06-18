import { createServerFn } from '@tanstack/react-start';
import {
  getOrganizationUserByIdInputSchema,
  inviteOrganizationUserInputSchema,
  organizationUserListItemSchema,
  organizationUserListSchema,
  organizationUsersListInputSchema,
  resendInvitationForOrganizationUserInputSchema,
} from '#/features/organization-users/schemas';
import { createSearchParams } from '#/lib/utils.ts';
import {
  authFetch,
  defaultServerError,
  genericApiErrorHandler,
} from '#/lib/auth-fetch.ts';
import { env } from '#/env.ts';
import { genericResponseSchema } from '#/lib/schemas.ts';

export const getOrganizationUsers = createServerFn()
  .validator(organizationUsersListInputSchema)
  .handler(async ({ data }) => {
    const searchParams = createSearchParams({
      ...data,
    });

    const response = await authFetch(
      `${env.SERVER_URL}/organization-users?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult = organizationUserListSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const getOrganizationUser = createServerFn()
  .validator(getOrganizationUserByIdInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/organization-users/${data.organizationUserId}`,
      {
        method: 'GET',
      },
    );

    await genericApiErrorHandler(response);

    const responseData = await response.json();

    const validationResult =
      organizationUserListItemSchema.safeParse(responseData);

    if (!validationResult.success) {
      throw defaultServerError;
    }

    return validationResult.data;
  });

export const inviteOrganizationUser = createServerFn()
  .validator(inviteOrganizationUserInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(`${env.SERVER_URL}/organization-users`, {
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

export const resendInvitationForOrganizationUser = createServerFn()
  .validator(resendInvitationForOrganizationUserInputSchema)
  .handler(async ({ data }) => {
    const response = await authFetch(
      `${env.SERVER_URL}/organization-users/${data.organizationUserId}/resend-invitation`,
      {
        method: 'POST',
      },
    );

    await genericApiErrorHandler(response);
  });
