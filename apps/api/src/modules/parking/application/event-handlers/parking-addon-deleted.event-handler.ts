import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ParkingAddonDeletedEvent } from '../../domain/events/parking-addon-deleted.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingAddonDeletedEvent)
export class ParkingAddonDeletedEventHandler implements IEventHandler<ParkingAddonDeletedEvent> {
  private readonly logger = new Logger(ParkingAddonDeletedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingAddonDeletedEvent) {
    this.logger.log(`Parking addon deleted: ${event.id}`);

    const { id } = event;

    await this.prismaService.parkingAddonRead.delete({
      where: {
        parkingAddonId: id,
      },
    });
  }
}
