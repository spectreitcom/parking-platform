import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingUpdatedEvent } from '../../domain/events/parking-updated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingUpdatedEvent)
export class ParkingUpdatedEventHandler implements IEventHandler<ParkingUpdatedEvent> {
  private readonly logger = new Logger(ParkingUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingUpdatedEvent) {
    this.logger.log(`Parking updated: ${event.id}`);

    const { name, address, id } = event;

    await this.prismaService.parkingListForAdminRead.update({
      where: {
        id,
      },
      data: {
        parkingName: name,
        parkingAddress: address,
      },
    });
  }
}
