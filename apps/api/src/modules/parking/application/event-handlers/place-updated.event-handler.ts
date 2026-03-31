import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceUpdatedEvent } from '../../domain/events/place-updated.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(PlaceUpdatedEvent)
export class PlaceUpdatedEventHandler implements IEventHandler<PlaceUpdatedEvent> {
  private readonly logger = new Logger(PlaceUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: PlaceUpdatedEvent) {
    this.logger.log(`Place updated: ${event.id}`);
    const {
      id,
      name,
      active,
      address,
      placeTypeId,
      latitude,
      longitude,
      version,
    } = event;

    const placeType = await this.prismaService.placeType.findUnique({
      where: { id: placeTypeId },
    });

    if (!placeType) {
      this.logger.error(`Place type not found: ${placeTypeId}`);
      throw new Error(`Place type not found: ${placeTypeId}`);
    }

    const data = {
      name,
      active,
      address,
      placeTypeId,
      latitude,
      longitude,
      placeTypeName: placeType.name,
      version,
    };

    await this.prismaService.placeRead.upsert({
      where: { placeId: id },
      update: data,
      create: {
        placeId: id,
        ...data,
      },
    });
  }
}
