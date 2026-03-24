import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceTypeUpdatedEvent } from '../../domain/events/place-type-updated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(PlaceTypeUpdatedEvent)
export class PlaceTypeUpdatedEventHandler implements IEventHandler<PlaceTypeUpdatedEvent> {
  private readonly logger = new Logger(PlaceTypeUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: PlaceTypeUpdatedEvent) {
    this.logger.log(`Place type updated: ${event.id}`);

    const { id, name, version } = event;

    await this.prismaService.placeTypeRead.update({
      where: {
        placeTypeId: id,
      },
      data: {
        name,
        version,
      },
    });
  }
}
