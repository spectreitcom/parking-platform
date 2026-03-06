import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserActivatedEvent } from '../../domain/events/admin-user-activated.event';

@EventsHandler(AdminUserActivatedEvent)
export class AdminUserActivatedEventHandler implements IEventHandler<AdminUserActivatedEvent> {
  private readonly logger = new Logger(AdminUserActivatedEventHandler.name);

  handle(event: AdminUserActivatedEvent) {
    this.logger.log(`Admin user activated: ${event.id}`);
  }
}
