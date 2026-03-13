import { OrganizationUserCreatedIeHandler } from './organization-user-created.ie-handler';
import { OrganizationUserInvitedIeHandler } from './organization-user-invited.ie-handler';
import { OrganizationUserUpdatedIeHandler } from './organization-user-updated.ie-handler';

export const ieHandlers = [
  OrganizationUserCreatedIeHandler,
  OrganizationUserInvitedIeHandler,
  OrganizationUserUpdatedIeHandler,
];
