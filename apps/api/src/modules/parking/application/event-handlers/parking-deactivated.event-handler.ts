import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingDeactivatedEvent } from '../../domain/events/parking-deactivated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ParkingDeactivatedEvent)
export class ParkingDeactivatedEventHandler implements IEventHandler<ParkingDeactivatedEvent> {
  private readonly logger = new Logger(ParkingDeactivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingDeactivatedEvent) {
    this.logger.log(`Parking deactivated: ${event.id}`);
    const { id, version, updatedAt } = event;

    await this.prismaService.parkingListForAdminRead.updateMany({
      where: {
        parkingId: id,
      },
      data: {
        parkingActive: false,
        version,
      },
    });

    await this.prismaService.parkingRead.updateMany({
      where: {
        parkingId: id,
      },
      data: {
        active: false,
        version,
        updatedAt,
      },
    });
  }
}
