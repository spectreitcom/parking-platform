import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PlaceTypeDeletedEvent } from '../../domain/events/place-type-deleted.event';
import { Logger } from '@nestjs/common';

@EventsHandler(PlaceTypeDeletedEvent)
export class PlaceTypeDeletedEventHandler implements IEventHandler<PlaceTypeDeletedEvent> {
  private readonly logger = new Logger(PlaceTypeDeletedEventHandler.name);

  handle(event: PlaceTypeDeletedEvent) {
    this.logger.log(`Place type deleted: ${event.id}`);
  }
}
