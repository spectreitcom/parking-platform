import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceCreatedEvent } from '../../domain/events/place-created.event';

@EventsHandler(PlaceCreatedEvent)
export class PlaceCreatedEventHandler implements IEventHandler<PlaceCreatedEvent> {
  private readonly logger = new Logger(PlaceCreatedEventHandler.name);

  handle(event: PlaceCreatedEvent) {
    this.logger.log(`Place created: ${event.id}`);
  }
}
