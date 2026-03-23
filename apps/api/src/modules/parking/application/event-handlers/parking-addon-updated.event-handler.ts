import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingAddonUpdatedEvent } from '../../domain/events/parking-addon-updated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingAddonUpdatedEvent)
export class ParkingAddonUpdatedEventHandler implements IEventHandler<ParkingAddonUpdatedEvent> {
  private readonly logger = new Logger(ParkingAddonUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingAddonUpdatedEvent) {
    this.logger.log(`Parking addon updated: ${event.id}`);

    const { name, version, price, id, code } = event;

    await this.prismaService.parkingAddonRead.update({
      where: {
        parkingAddonId: id,
      },
      data: {
        name,
        price,
        code,
        version,
      },
    });
  }
}
