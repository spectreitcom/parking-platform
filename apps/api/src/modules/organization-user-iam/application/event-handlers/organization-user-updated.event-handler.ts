import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationUserUpdatedEvent } from '../../domain/events/organization-user-updated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(OrganizationUserUpdatedEvent)
export class OrganizationUserUpdatedEventHandler implements IEventHandler<OrganizationUserUpdatedEvent> {
  private readonly logger = new Logger(
    OrganizationUserUpdatedEventHandler.name,
  );

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: OrganizationUserUpdatedEvent) {
    this.logger.log(
      `Handling OrganizationUserUpdatedEvent for user ${event.organizationUserId}`,
    );

    const { organizationUserId, displayName } = event;

    await this.prismaService.organizationUserRead.update({
      where: { organizationUserId },
      data: {
        displayName,
      },
    });
  }
}
