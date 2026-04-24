import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotCreatedEvent } from '../../domain/events/parking-spot-created.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ParkingSpotCreatedEvent)
export class ParkingSpotCreatedEventHandler implements IEventHandler<ParkingSpotCreatedEvent> {
  private readonly logger = new Logger(ParkingSpotCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingSpotCreatedEvent) {
    this.logger.log(`Parking spot created: ${event.id}`);
    const { parkingId } = event;

    await this.prismaService.parkingListForAdminRead.updateMany({
      where: {
        parkingId,
      },
      data: {
        parkingSpotsNumber: {
          increment: 1,
        },
      },
    });
  }
}
