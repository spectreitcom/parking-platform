import { OrganizationUserCreatedEventHandler } from './organization-user-created.event-handler';
import { OrganizationUserUpdatedEventHandler } from './organization-user-updated.event-handler';
import { OrganizationUserActivatedEventHandler } from './organization-user-activated.event-handler';
import { OrganizationUserSuspendedEventHandler } from './organization-user-suspended.event-handler';
import { OrganizationUserInvitedEventHandler } from './organization-user-invited.event-handler';
import { OrganizationUserPasswordChangedEventHandler } from './organization-user-password-changed.event-handler';

export const eventHandlers = [
  OrganizationUserCreatedEventHandler,
  OrganizationUserUpdatedEventHandler,
  OrganizationUserActivatedEventHandler,
  OrganizationUserSuspendedEventHandler,
  OrganizationUserInvitedEventHandler,
  OrganizationUserPasswordChangedEventHandler,
];
