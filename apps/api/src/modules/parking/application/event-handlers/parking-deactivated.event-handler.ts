import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingDeactivatedEvent } from '../../domain/events/parking-deactivated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingDeactivatedEvent)
export class ParkingDeactivatedEventHandler implements IEventHandler<ParkingDeactivatedEvent> {
  private readonly logger = new Logger(ParkingDeactivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingDeactivatedEvent) {
    this.logger.log(`Parking deactivated: ${event.id}`);
    const { id } = event;

    await this.prismaService.parkingListForAdminRead.update({
      where: {
        id,
      },
      data: {
        parkingActive: false,
      },
    });
  }
}
