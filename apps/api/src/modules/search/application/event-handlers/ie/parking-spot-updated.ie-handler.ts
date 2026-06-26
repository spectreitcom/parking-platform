import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingIntegrationEventTypes,
  ParkingSpotUpdatedV1Payload,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { OutboxService } from 'src/shared/outbox/outbox.service';

type Event = IntegrationEvent<
  ParkingSpotUpdatedV1Payload,
  ParkingIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ParkingSpotUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ParkingSpotUpdatedIeHandler.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'parking.parking-spot.updated.v1') return;

    this.logger.debug(
      `Received parking spot updated event: ${JSON.stringify(event)}`,
    );

    const outboxId = event.headers?.outboxId;

    try {
      const { parkingId, featureIds, features } = event.payload;

      await this.prismaService.search.update({
        where: { parkingId },
        data: {
          featureIds,
          features,
        },
      });
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
