import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingUpdatedEvent } from '../../domain/events/parking-updated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ParkingUpdatedEvent)
export class ParkingUpdatedEventHandler implements IEventHandler<ParkingUpdatedEvent> {
  private readonly logger = new Logger(ParkingUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingUpdatedEvent) {
    this.logger.log(`Parking updated: ${event.id}`);

    const {
      name,
      address,
      id,
      version,
      active,
      assetIds,
      parkingFeatureIds,
      parkingAddonIds,
      placeId,
      organizationId,
      latitude,
      statute,
      longitude,
      description,
      updatedAt,
      createdAt,
    } = event;

    const organization =
      await this.prismaService.parkingOrganization.findUnique({
        where: { organizationId },
      });

    await this.prismaService.parkingListForAdminRead.updateMany({
      where: {
        parkingId: id,
      },
      data: {
        parkingName: name,
        parkingAddress: address,
        organizationName: organization?.name,
      },
    });

    await this.prismaService.parkingRead.updateMany({
      where: {
        parkingId: id,
      },
      data: {
        name,
        longitude,
        latitude,
        statute,
        description,
        organizationId,
        assetIds,
        parkingFeatureIds,
        parkingAddonIds,
        placeId,
        active,
        address,
        createdAt,
        updatedAt,
        version,
      },
    });
  }
}
