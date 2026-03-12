import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationUserInvitedEvent } from '../../domain/events/organization-user-invited.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ORGANIZATION_USER_INVITED } from '../../domain/constants';
import { OrganizationUserStatusMapperService } from '../ports/organization-user-status-mapper.service';

@EventsHandler(OrganizationUserInvitedEvent)
export class OrganizationUserInvitedEventHandler implements IEventHandler<OrganizationUserInvitedEvent> {
  private readonly logger = new Logger(
    OrganizationUserInvitedEventHandler.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly organizationUserStatusMapperService: OrganizationUserStatusMapperService,
  ) {}

  async handle(event: OrganizationUserInvitedEvent) {
    this.logger.log(
      `Handling OrganizationUserInvitedEvent for user ${event.organizationUserId}`,
    );

    const { organizationUserId, email, displayName } = event;

    await this.prismaService.organizationUserRead.upsert({
      where: { organizationUserId },
      update: {
        statusText: this.organizationUserStatusMapperService.toText(
          ORGANIZATION_USER_INVITED,
        ),
      },
      create: {
        organizationUserId,
        email,
        displayName,
        statusText: this.organizationUserStatusMapperService.toText(
          ORGANIZATION_USER_INVITED,
        ),
      },
    });
  }
}
