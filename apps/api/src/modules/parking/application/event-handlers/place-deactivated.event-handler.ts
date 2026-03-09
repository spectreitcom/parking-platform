import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceDeactivatedEvent } from '../../domain/events/place-deactivated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(PlaceDeactivatedEvent)
export class PlaceDeactivatedEventHandler implements IEventHandler<PlaceDeactivatedEvent> {
  private readonly logger = new Logger(PlaceDeactivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: PlaceDeactivatedEvent) {
    this.logger.log(`Place deactivated: ${event.id}`);
    const { id } = event;

    await this.prismaService.placeRead.update({
      where: { placeId: id },
      data: {
        active: false,
      },
    });
  }
}
