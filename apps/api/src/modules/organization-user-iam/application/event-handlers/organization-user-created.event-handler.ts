import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationUserCreatedEvent } from '../../domain/events/organization-user-created.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { OrganizationUserStatusMapperService } from '../ports/organization-user-status-mapper.service';

@EventsHandler(OrganizationUserCreatedEvent)
export class OrganizationUserCreatedEventHandler implements IEventHandler<OrganizationUserCreatedEvent> {
  private readonly logger = new Logger(
    OrganizationUserCreatedEventHandler.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly organizationUserStatusMapperService: OrganizationUserStatusMapperService,
  ) {}

  async handle(event: OrganizationUserCreatedEvent) {
    this.logger.log(
      `Handling OrganizationUserCreatedEvent for user ${event.organizationUserId}`,
    );

    const { organizationUserId, email, displayName, status } = event;

    await this.prismaService.organizationUserRead.upsert({
      where: { organizationUserId },
      update: {},
      create: {
        organizationUserId,
        email,
        displayName,
        statusText: this.organizationUserStatusMapperService.toText(status),
      },
    });
  }
}
