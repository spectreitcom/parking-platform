import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationUserActivatedEvent } from '../../domain/events/organization-user-activated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ORGANIZATION_USER_ACTIVE } from '../../domain/constants';
import { OrganizationUserStatusMapperService } from '../ports/organization-user-status-mapper.service';

@EventsHandler(OrganizationUserActivatedEvent)
export class OrganizationUserActivatedEventHandler implements IEventHandler<OrganizationUserActivatedEvent> {
  private readonly logger = new Logger(
    OrganizationUserActivatedEventHandler.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly organizationUserStatusMapperService: OrganizationUserStatusMapperService,
  ) {}

  async handle(event: OrganizationUserActivatedEvent) {
    this.logger.log(
      `Handling OrganizationUserActivatedEvent for user ${event.organizationUserId}`,
    );

    const { organizationUserId } = event;

    await this.prismaService.organizationUserRead.update({
      where: { organizationUserId },
      data: {
        statusText: this.organizationUserStatusMapperService.toText(
          ORGANIZATION_USER_ACTIVE,
        ),
      },
    });
  }
}
