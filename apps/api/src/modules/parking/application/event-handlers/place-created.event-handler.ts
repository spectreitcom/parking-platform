import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceCreatedEvent } from '../../domain/events/place-created.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(PlaceCreatedEvent)
export class PlaceCreatedEventHandler implements IEventHandler<PlaceCreatedEvent> {
  private readonly logger = new Logger(PlaceCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: PlaceCreatedEvent) {
    this.logger.log(`Place created: ${event.id}`);
    const { id, name, placeTypeId, address, active, longitude, latitude } =
      event;

    const placeType = await this.prismaService.placeType.findUnique({
      where: { id: placeTypeId },
    });

    if (!placeType) {
      this.logger.error(`Place type not found: ${placeTypeId}`);
      throw new Error(`Place type not found: ${placeTypeId}`);
    }

    await this.prismaService.placeRead.upsert({
      where: { placeId: id },
      update: {
        placeId: id,
        name: name,
        active,
        address,
        placeTypeId,
        latitude,
        longitude,
        placeTypeName: placeType.name,
      },
      create: {
        placeId: id,
        name: name,
        active,
        address,
        placeTypeId,
        latitude,
        longitude,
        placeTypeName: placeType.name,
      },
    });
  }
}
