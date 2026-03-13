import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamUpdatedV1Payload,
} from '../../../../organization-user-iam/application/contracts/integration-events';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/prisma/prisma.service';

type Event = IntegrationEvent<
  OrganizationUserIamUpdatedV1Payload,
  OrganizationUserIamIntegrationEventTypes
>;

@EventsHandler(Event)
export class OrganizationUserUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(OrganizationUserUpdatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'organization-user-iam.organization-user.updated.v1')
      return;

    this.logger.debug(
      `Handling OrganizationUserUpdated event: ${JSON.stringify(event)}`,
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
