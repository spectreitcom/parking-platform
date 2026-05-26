import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotActivatedEvent } from '../../domain/events/parking-spot-activated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ParkingSpotActivatedEvent)
export class ParkingSpotActivatedEventHandler implements IEventHandler<ParkingSpotActivatedEvent> {
  private readonly logger = new Logger(ParkingSpotActivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingSpotActivatedEvent) {
    this.logger.log(`Parking spot activated: ${event.id}`);

    const { id, version } = event;

    await this.prismaService.parkingSpotRead.update({
      where: { id },
      data: { version, active: true },
    });
  }
}
