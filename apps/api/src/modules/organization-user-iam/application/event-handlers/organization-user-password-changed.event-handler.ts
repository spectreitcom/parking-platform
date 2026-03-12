import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationUserPasswordChangedEvent } from '../../domain/events/organization-user-password-changed.event';

@EventsHandler(OrganizationUserPasswordChangedEvent)
export class OrganizationUserPasswordChangedEventHandler implements IEventHandler<OrganizationUserPasswordChangedEvent> {
  private readonly logger = new Logger(
    OrganizationUserPasswordChangedEventHandler.name,
  );

  handle(event: OrganizationUserPasswordChangedEvent) {
    this.logger.log(
      `Handling OrganizationUserPasswordChangedEvent for user ${event.organizationUserId}`,
    );
  }
}
