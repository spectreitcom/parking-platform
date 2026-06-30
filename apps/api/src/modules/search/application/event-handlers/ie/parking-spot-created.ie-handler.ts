import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingIntegrationEventTypes,
  ParkingSpotCreatedV1Payload,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';

type Event = IntegrationEvent<
  ParkingSpotCreatedV1Payload,
  ParkingIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ParkingSpotCreatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ParkingSpotCreatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'parking.parking-spot.created.v1') return;

    this.logger.debug(
      `Received parking spot created event: ${JSON.stringify(event)}`,
    );

    const { parkingId, featureIds, features } = event.payload;

    await this.prismaService.search.update({
      where: { parkingId },
      data: {
        hasAvailableParkingSpots: true,
        featureIds,
        features,
      },
    });
  }
}
