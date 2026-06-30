import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamUpdatedV1Payload,
} from '@repo/api-contracts';

type Event = IntegrationEvent<
  OrganizationUserIamUpdatedV1Payload,
  OrganizationUserIamIntegrationEventTypes
>;
@EventsHandler(IntegrationEvent)
export class OrganizationUserUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(OrganizationUserUpdatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'organization-user-iam.organization-user.updated.v1')
      return;

    this.logger.debug(
      `Handling OrganizationUserUpdated event: ${event.payload.organizationUserId}`,
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
