import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamOrganizationUserInvitedV1Payload,
} from '../../../../organization-user-iam/application/contracts/integration-events';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';

type Event = IntegrationEvent<
  OrganizationUserIamOrganizationUserInvitedV1Payload,
  OrganizationUserIamIntegrationEventTypes
>;

@EventsHandler(Event)
export class OrganizationUserInvitedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(OrganizationUserInvitedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'organization-user-iam.organization-user.invited.v1')
      return;

    this.logger.debug(
      `Handling OrganizationUserInvited event: ${event.payload.organizationUserId}`,
    );

    const { organizationUserId, email, displayName } = event.payload;

    await this.prismaService.organizationOrganizationUser.upsert({
      where: {
        organizationUserId,
      },
      create: {
        organizationUserId,
        email,
        displayName,
      },
      update: {
        organizationUserId,
        email,
        displayName,
      },
    });
  }
}
