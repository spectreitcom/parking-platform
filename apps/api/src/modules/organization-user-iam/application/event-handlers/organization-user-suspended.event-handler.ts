import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationUserSuspendedEvent } from '../../domain/events/organization-user-suspended.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ORGANIZATION_USER_SUSPENDED } from '../../domain/constants';
import { OrganizationUserStatusMapperService } from '../ports/organization-user-status-mapper.service';

@EventsHandler(OrganizationUserSuspendedEvent)
export class OrganizationUserSuspendedEventHandler implements IEventHandler<OrganizationUserSuspendedEvent> {
  private readonly logger = new Logger(
    OrganizationUserSuspendedEventHandler.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly organizationUserStatusMapperService: OrganizationUserStatusMapperService,
  ) {}

  async handle(event: OrganizationUserSuspendedEvent) {
    this.logger.log(
      `Handling OrganizationUserSuspendedEvent for user ${event.organizationUserId}`,
    );

    const { organizationUserId } = event;

    await this.prismaService.organizationUserRead.update({
      where: { organizationUserId },
      data: {
        statusText: this.organizationUserStatusMapperService.toText(
          ORGANIZATION_USER_SUSPENDED,
        ),
      },
    });
  }
}
