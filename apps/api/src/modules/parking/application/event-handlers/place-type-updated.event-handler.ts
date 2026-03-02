import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceTypeUpdatedEvent } from '../../domain/events/place-type-updated.event';

@EventsHandler(PlaceTypeUpdatedEvent)
export class PlaceTypeUpdatedEventHandler implements IEventHandler<PlaceTypeUpdatedEvent> {
  private readonly logger = new Logger(PlaceTypeUpdatedEventHandler.name);

  handle(event: PlaceTypeUpdatedEvent) {
    this.logger.log(`Place type updated: ${event.id}`);
  }
}
