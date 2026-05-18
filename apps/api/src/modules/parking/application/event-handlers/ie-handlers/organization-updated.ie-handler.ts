import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  OrganizationUpdatedV1Payload,
  OrganizationIntegrationEventTypes,
} from '@repo/api-contracts';
import { Logger } from '@nestjs/common';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type Event = IntegrationEvent<
  OrganizationUpdatedV1Payload,
  OrganizationIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class OrganizationUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(OrganizationUpdatedIeHandler.name);

  constructor(
    private readonly outboxService: OutboxService,
    private readonly prismaService: PrismaService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'organization.organization.updated.v1') return;
    this.logger.debug(
      `Handling organization updated event: ${event.payload.organizationId}`,
    );

    const outboxId = event.headers?.outboxId;

    try {
      const { organizationId, name, address } = event.payload;

      await this.prismaService.parkingOrganization.upsert({
        where: { organizationId },
        update: {
          name,
          address,
        },
        create: {
          organizationId,
          name,
          address,
        },
      });

      await this.prismaService.parkingListForAdminRead.updateMany({
        where: { organizationId },
        data: {
          organizationName: name,
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
