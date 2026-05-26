import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotUpdatedEvent } from '../../domain/events/parking-spot-updated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ParkingSpotUpdatedEvent)
export class ParkingSpotUpdatedEventHandler implements IEventHandler<ParkingSpotUpdatedEvent> {
  private readonly logger = new Logger(ParkingSpotUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingSpotUpdatedEvent) {
    this.logger.log(`Parking spot updated: ${event.id}`);

    const {
      parkingId,
      parkingSpotFeatureIds,
      price,
      id,
      pricePLN,
      active,
      version,
    } = event;

    const parking = await this.prismaService.parkingRead.findUnique({
      where: { parkingId },
    });

    if (parking) {
      await this.prismaService.parkingSpotRead.update({
        where: { parkingSpotId: id },
        data: {
          parkingId,
          price,
          pricePLN,
          active,
          version,
          parkingSpotFeatureIds,
          organizationId: parking.organizationId,
        },
      });
    }
  }
}
