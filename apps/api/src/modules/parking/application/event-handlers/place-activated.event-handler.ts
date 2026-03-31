import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceActivatedEvent } from '../../domain/events/place-activated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(PlaceActivatedEvent)
export class PlaceActivatedEventHandler implements IEventHandler<PlaceActivatedEvent> {
  private readonly logger = new Logger(PlaceActivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: PlaceActivatedEvent) {
    this.logger.log(`Place activated: ${event.id}`);
    const { id, version } = event;
    await this.prismaService.placeRead.update({
      where: { placeId: id },
      data: {
        active: true,
        version,
      },
    });
  }
}
