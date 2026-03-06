import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserPasswordChangedEvent } from '../../domain/events/admin-user-password-changed.event';

@EventsHandler(AdminUserPasswordChangedEvent)
export class AdminUserPasswordChangedEventHandler implements IEventHandler<AdminUserPasswordChangedEvent> {
  private readonly logger = new Logger(
    AdminUserPasswordChangedEventHandler.name,
  );

  handle(event: AdminUserPasswordChangedEvent) {
    this.logger.log(`Admin user password changed: ${event.id}`);
  }
}
