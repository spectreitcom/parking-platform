import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingUpdatedV1Payload,
  ParkingIntegrationEventTypes,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { OutboxService } from 'src/shared/outbox/outbox.service';

type Event = IntegrationEvent<
  ParkingUpdatedV1Payload,
  ParkingIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ParkingUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ParkingUpdatedIeHandler.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'parking.parking.updated.v1') return;

    this.logger.debug(
      `Received parking updated event: ${JSON.stringify(event)}`,
    );

    const outboxId = event.headers?.outboxId;

    try {
      const {
        parkingId,
        name,
        distance,
        active,
        placeId,
        longitude,
        latitude,
        assetIds,
        featureIds,
        features,
      } = event.payload;

      await this.prismaService.search.upsert({
        where: { parkingId },
        update: {
          name,
          distance,
          active,
          placeId,
          longitude,
          latitude,
          assetIds,
          features,
          featureIds,
        },
        create: {
          parkingId,
          name,
          distance,
          active,
          placeId,
          longitude,
          latitude,
          assetIds,
          features,
          featureIds,
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
