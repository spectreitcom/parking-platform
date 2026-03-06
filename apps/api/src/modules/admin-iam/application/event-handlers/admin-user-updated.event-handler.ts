import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserUpdatedEvent } from '../../domain/events/admin-user-updated.event';

@EventsHandler(AdminUserUpdatedEvent)
export class AdminUserUpdatedEventHandler implements IEventHandler<AdminUserUpdatedEvent> {
  private readonly logger = new Logger(AdminUserUpdatedEventHandler.name);

  handle(event: AdminUserUpdatedEvent) {
    this.logger.log(`Admin user updated: ${event.id}`);
  }
}
