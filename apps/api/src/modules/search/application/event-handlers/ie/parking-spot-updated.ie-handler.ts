import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingIntegrationEventTypes,
  ParkingSpotUpdatedV1Payload,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';

type Event = IntegrationEvent<
  ParkingSpotUpdatedV1Payload,
  ParkingIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ParkingSpotUpdatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ParkingSpotUpdatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'parking.parking-spot.updated.v1') return;

    this.logger.debug(
      `Received parking spot updated event: ${JSON.stringify(event)}`,
    );

    const { parkingId, featureIds, features } = event.payload;

    await this.prismaService.search.update({
      where: { parkingId },
      data: {
        featureIds,
        features,
      },
    });
  }
}
