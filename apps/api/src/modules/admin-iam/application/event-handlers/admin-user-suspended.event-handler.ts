import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserSuspendedEvent } from '../../domain/events/admin-user-suspended.event';

@EventsHandler(AdminUserSuspendedEvent)
export class AdminUserSuspendedEventHandler implements IEventHandler<AdminUserSuspendedEvent> {
  private readonly logger = new Logger(AdminUserSuspendedEventHandler.name);

  handle(event: AdminUserSuspendedEvent) {
    this.logger.log(`Admin user suspended: ${event.id}`);
  }
}
