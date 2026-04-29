import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingActivatedEvent } from '../../domain/events/parking-activated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ParkingActivatedEvent)
export class ParkingActivatedEventHandler implements IEventHandler<ParkingActivatedEvent> {
  private readonly logger = new Logger(ParkingActivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingActivatedEvent) {
    this.logger.log(`Parking activated: ${event.id}`);
    const { id, version, updatedAt } = event;

    await this.prismaService.parkingListForAdminRead.updateMany({
      where: {
        parkingId: id,
      },
      data: {
        parkingActive: true,
        version,
      },
    });

    await this.prismaService.parkingRead.updateMany({
      where: {
        parkingId: id,
      },
      data: {
        active: true,
        version,
        updatedAt,
      },
    });
  }
}
