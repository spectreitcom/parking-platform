import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotDeactivatedEvent } from '../../domain/events/parking-spot-deactivated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ParkingSpotDeactivatedEvent)
export class ParkingSpotDeactivatedEventHandler implements IEventHandler<ParkingSpotDeactivatedEvent> {
  private readonly logger = new Logger(ParkingSpotDeactivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingSpotDeactivatedEvent) {
    this.logger.log(`Parking spot deactivated: ${event.id}`);

    const { id, version } = event;

    await this.prismaService.parkingSpotRead.update({
      where: { id },
      data: { version, active: false },
    });
  }
}
