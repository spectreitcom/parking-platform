import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceTypeCreatedEvent } from '../../domain/events/place-type-created.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(PlaceTypeCreatedEvent)
export class PlaceTypeCreatedEventHandler implements IEventHandler<PlaceTypeCreatedEvent> {
  private readonly logger = new Logger(PlaceTypeCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: PlaceTypeCreatedEvent) {
    this.logger.log(`Place type created: ${event.id}`);

    const { name, version, id } = event;

    await this.prismaService.placeTypeRead.upsert({
      where: {
        placeTypeId: id,
      },
      create: {
        placeTypeId: id,
        name,
        version,
      },
      update: {
        name,
        version,
      },
    });
  }
}
