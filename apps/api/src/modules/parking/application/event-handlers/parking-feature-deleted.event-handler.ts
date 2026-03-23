import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingFeatureDeletedEvent } from '../../domain/events/parking-feature-deleted.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(ParkingFeatureDeletedEvent)
export class ParkingFeatureDeletedEventHandler implements IEventHandler<ParkingFeatureDeletedEvent> {
  private readonly logger = new Logger(ParkingFeatureDeletedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ParkingFeatureDeletedEvent) {
    this.logger.log(`Parking feature deleted: ${event.id}`);
    const { id } = event;

    await this.prismaService.parkingFeatureRead.delete({
      where: {
        parkingFeatureId: id,
      },
    });
  }
}
