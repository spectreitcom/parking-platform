import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingAddonUpdatedEvent } from '../../domain/events/parking-addon-updated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Money } from 'src/shared/value-objects/money';

@EventsHandler(ParkingAddonUpdatedEvent)
export class ParkingAddonUpdatedEventHandler implements IEventHandler<ParkingAddonUpdatedEvent> {
  private readonly logger = new Logger(ParkingAddonUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingAddonUpdatedEvent) {
    this.logger.log(`Parking addon updated: ${event.id}`);

    const { name, version, price, id, code } = event;

    const _priceValue = Money.fromNumber(price);

    await this.prismaService.parkingAddonRead.updateMany({
      where: {
        parkingAddonId: id,
        version: {
          lt: version,
        },
      },
      data: {
        name,
        price,
        code,
        version,
        priceInPln: _priceValue.toPLN(),
      },
    });
  }
}
