import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamUpdatedV1Payload,
} from '@repo/api-contracts';
import { OutboxService } from 'src/shared/outbox/outbox.service';

type Event = IntegrationEvent<
  OrganizationUserIamUpdatedV1Payload,
  OrganizationUserIamIntegrationEventTypes
>;
@EventsHandler(IntegrationEvent)
export class OrganizationUserUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(OrganizationUserUpdatedIeHandler.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'organization-user-iam.organization-user.updated.v1')
      return;

    this.logger.debug(
      `Handling OrganizationUserUpdated event: ${event.payload.organizationUserId}`,
    );

    const outboxId = event.headers?.outboxId;

    try {
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

      if (outboxId) {
        await this.outboxService.ack(outboxId);
      }
    } catch (error) {
      if (outboxId) {
        await this.outboxService.nack(outboxId, {
          requeue: true,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  }
}
