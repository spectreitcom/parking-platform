import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingCreatedEvent } from '../../domain/events/parking-created.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { DistanceCalculator } from 'src/modules/parking/application/ports/distance-calculator';

@EventsHandler(ParkingCreatedEvent)
export class ParkingCreatedEventHandler implements IEventHandler<ParkingCreatedEvent> {
  private readonly logger = new Logger(ParkingCreatedEventHandler.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly distanceCalculator: DistanceCalculator,
  ) {}

  async handle(event: ParkingCreatedEvent) {
    this.logger.log(`Parking created: ${event.id}`);
    const {
      id: parkingId,
      organizationId,
      placeId,
      name,
      address,
      active,
      version,
    } = event;

    const organizationRecord =
      await this.prismaService.parkingOrganization.findUnique({
        where: { organizationId },
      });

    const placeRecord = await this.prismaService.place.findUnique({
      where: { id: placeId },
    });

    let distance = 0;

    if (
      placeRecord?.latitude &&
      placeRecord?.longitude &&
      Number.isFinite(event.latitude) &&
      Number.isFinite(event.longitude)
    ) {
      distance = this.distanceCalculator.calculate(
        placeRecord.latitude.toNumber(),
        placeRecord.longitude.toNumber(),
        event.latitude,
        event.longitude,
      ) as number;
    }

    await this.prismaService.parkingListForAdminRead.upsert({
      where: { parkingId_organizationId: { parkingId, organizationId } },
      update: {
        placeId,
        parkingName: name,
        parkingAddress: address,
        placeName: placeRecord?.name ?? '',
        parkingActive: active,
        organizationName: organizationRecord?.name ?? '',
        version,
        distance,
      },
      create: {
        parkingId,
        organizationId,
        placeId,
        parkingName: name,
        parkingAddress: address,
        placeName: placeRecord?.name ?? '',
        parkingActive: active,
        parkingSpotsNumber: 0,
        organizationName: organizationRecord?.name ?? '',
        version,
        distance,
      },
    });
  }
}
