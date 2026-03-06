import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserInvitedEvent } from '../../domain/events/admin-user-invited.event';

@EventsHandler(AdminUserInvitedEvent)
export class AdminUserInvitedEventHandler implements IEventHandler<AdminUserInvitedEvent> {
  private readonly logger = new Logger(AdminUserInvitedEventHandler.name);

  handle(event: AdminUserInvitedEvent) {
    this.logger.log(`Admin user invited: ${event.id}`);
  }
}
