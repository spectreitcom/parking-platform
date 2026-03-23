import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingAddonCreatedEvent } from '../../domain/events/parking-addon-created.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Money } from '../../../../shared/value-objects/money';

@EventsHandler(ParkingAddonCreatedEvent)
export class ParkingAddonCreatedEventHandler implements IEventHandler<ParkingAddonCreatedEvent> {
  private readonly logger = new Logger(ParkingAddonCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingAddonCreatedEvent) {
    this.logger.log(`Parking addon created: ${event.id}`);

    const { id, name, price, code, version } = event;

    const priceValue = Money.fromNumber(price);

    await this.prismaService.parkingAddonRead.upsert({
      where: { parkingAddonId: id },
      create: {
        parkingAddonId: id,
        name,
        price,
        code,
        version,
        priceInPln: priceValue.toPLN(),
      },
      update: {
        name,
        price,
        code,
        version,
        priceInPln: priceValue.toPLN(),
      },
    });
  }
}
