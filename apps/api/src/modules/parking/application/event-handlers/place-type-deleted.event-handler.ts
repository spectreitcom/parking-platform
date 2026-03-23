import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PlaceTypeDeletedEvent } from '../../domain/events/place-type-deleted.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(PlaceTypeDeletedEvent)
export class PlaceTypeDeletedEventHandler implements IEventHandler<PlaceTypeDeletedEvent> {
  private readonly logger = new Logger(PlaceTypeDeletedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: PlaceTypeDeletedEvent) {
    this.logger.log(`Place type deleted: ${event.id}`);

    const { id } = event;

    await this.prismaService.placeTypeRead.delete({
      where: {
        placeTypeId: id,
      },
    });
  }
}
