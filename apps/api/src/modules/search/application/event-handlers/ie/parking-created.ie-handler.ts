import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingCreatedV1Payload,
  ParkingIntegrationEventTypes,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';

type Event = IntegrationEvent<
  ParkingCreatedV1Payload,
  ParkingIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ParkingCreatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ParkingCreatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'parking.parking.created.v1') return;

    this.logger.debug(
      `Received parking created event: ${JSON.stringify(event)}`,
    );

    const { parkingId, name, distance, active, placeId, longitude, latitude } =
      event.payload;

    await this.prismaService.search.upsert({
      where: { parkingId },
      update: {
        parkingId,
        name,
        distance,
        active,
        placeId,
        longitude,
        latitude,
      },
      create: {
        parkingId,
        name,
        distance,
        active,
        placeId,
        longitude,
        latitude,
        assetIds: [],
        features: [],
        featureIds: [],
      },
    });
  }
}
