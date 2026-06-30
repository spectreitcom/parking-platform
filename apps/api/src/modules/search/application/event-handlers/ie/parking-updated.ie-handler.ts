import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingUpdatedV1Payload,
  ParkingIntegrationEventTypes,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';

type Event = IntegrationEvent<
  ParkingUpdatedV1Payload,
  ParkingIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ParkingUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ParkingUpdatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'parking.parking.updated.v1') return;

    this.logger.debug(
      `Received parking updated event: ${JSON.stringify(event)}`,
    );

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
  }
}
