import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserCreatedEvent } from '../../domain/events/admin-user-created.event';

@EventsHandler(AdminUserCreatedEvent)
export class AdminUserCreatedEventHandler implements IEventHandler<AdminUserCreatedEvent> {
  private readonly logger = new Logger(AdminUserCreatedEventHandler.name);

  handle(event: AdminUserCreatedEvent) {
    this.logger.log(`Admin user created: ${event.id}`);
  }
}
