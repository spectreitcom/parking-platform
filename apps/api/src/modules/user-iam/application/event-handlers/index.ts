import { UserCreatedEventHandler } from 'src/modules/user-iam/application/event-handlers/user-created.event-handler';
import { UserUpdatedEventHandler } from 'src/modules/user-iam/application/event-handlers/user-updated.event-handler';
import { UserChangedPasswordEventHandler } from 'src/modules/user-iam/application/event-handlers/user-changed-password.event-handler';

export const eventHandlers = [
  UserCreatedEventHandler,
  UserUpdatedEventHandler,
  UserChangedPasswordEventHandler,
];
