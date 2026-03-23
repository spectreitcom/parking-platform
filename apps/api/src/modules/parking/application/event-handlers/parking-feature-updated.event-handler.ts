import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingFeatureUpdatedEvent } from '../../domain/events/parking-feature-updated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingFeatureUpdatedEvent)
export class ParkingFeatureUpdatedEventHandler implements IEventHandler<ParkingFeatureUpdatedEvent> {
  private readonly logger = new Logger(ParkingFeatureUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingFeatureUpdatedEvent) {
    this.logger.log(`Parking feature updated: ${event.id}`);
    const { name, levels, id, version } = event;

    await this.prismaService.parkingFeatureRead.update({
      where: {
        parkingFeatureId: id,
      },
      data: {
        name,
        levels,
        version,
      },
    });
  }
}
