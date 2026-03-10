import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingCreatedEvent } from '../../domain/events/parking-created.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingCreatedEvent)
export class ParkingCreatedEventHandler implements IEventHandler<ParkingCreatedEvent> {
  private readonly logger = new Logger(ParkingCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingCreatedEvent) {
    this.logger.log(`Parking created: ${event.id}`);
    const { id: parkingId, organizationId, placeId } = event;

    const organizationRecord =
      await this.prismaService.parkingOrganization.findUnique({
        where: { organizationId },
      });

    const parkingRecord = await this.prismaService.parking.findUnique({
      where: { id: parkingId },
    });

    const placeRecord = await this.prismaService.place.findUnique({
      where: { id: placeId },
    });

    await this.prismaService.parkingListForAdminRead.create({
      data: {
        parkingId,
        organizationId,
        placeId,
        parkingName: parkingRecord?.name ?? '',
        parkingAddress: parkingRecord?.address ?? '',
        placeName: placeRecord?.name ?? '',
        parkingActive: parkingRecord?.active ?? false,
        parkingSpotsNumber: 0,
        organizationName: organizationRecord?.name ?? '',
      },
    });
  }
}
