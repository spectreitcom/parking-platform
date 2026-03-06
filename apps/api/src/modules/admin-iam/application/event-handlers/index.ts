import { AdminUserCreatedEventHandler } from './admin-user-created.event-handler';
import { AdminUserUpdatedEventHandler } from './admin-user-updated.event-handler';
import { AdminUserActivatedEventHandler } from './admin-user-activated.event-handler';
import { AdminUserSuspendedEventHandler } from './admin-user-suspended.event-handler';
import { AdminUserInvitedEventHandler } from './admin-user-invited.event-handler';
import { AdminUserPasswordChangedEventHandler } from './admin-user-password-changed.event-handler';

export const eventHandlers = [
  AdminUserCreatedEventHandler,
  AdminUserUpdatedEventHandler,
  AdminUserActivatedEventHandler,
  AdminUserSuspendedEventHandler,
  AdminUserInvitedEventHandler,
  AdminUserPasswordChangedEventHandler,
];
