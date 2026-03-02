import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceUpdatedEvent } from '../../domain/events/place-updated.event';

@EventsHandler(PlaceUpdatedEvent)
export class PlaceUpdatedEventHandler implements IEventHandler<PlaceUpdatedEvent> {
  private readonly logger = new Logger(PlaceUpdatedEventHandler.name);

  handle(event: PlaceUpdatedEvent) {
    this.logger.log(`Place updated: ${event.id}`);
  }
}
