import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingFeatureCreatedEvent } from '../../domain/events/parking-feature-created.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingFeatureCreatedEvent)
export class ParkingFeatureCreatedEventHandler implements IEventHandler<ParkingFeatureCreatedEvent> {
  private readonly logger = new Logger(ParkingFeatureCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingFeatureCreatedEvent) {
    this.logger.log(`Parking feature created: ${event.id}`);

    const { name, levels, id, version } = event;

    await this.prismaService.parkingFeatureRead.upsert({
      where: {
        parkingFeatureId: id,
      },
      create: {
        parkingFeatureId: id,
        name,
        levels,
        version,
      },
      update: {
        name,
        levels,
        version,
      },
    });
  }
}
