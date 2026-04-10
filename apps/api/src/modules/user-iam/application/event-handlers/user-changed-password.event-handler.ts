import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserChangedPasswordEvent } from 'src/modules/user-iam/domain/events/user-changed-password.event';
import { Logger } from '@nestjs/common';

@EventsHandler(UserChangedPasswordEvent)
export class UserChangedPasswordEventHandler implements IEventHandler<UserChangedPasswordEvent> {
  private readonly logger = new Logger(UserChangedPasswordEventHandler.name);

  handle(event: UserChangedPasswordEvent) {
    this.logger.log('User changed password', event.userId);
  }
}
