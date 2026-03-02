import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceTypeCreatedEvent } from '../../domain/events/place-type-created.event';

@EventsHandler(PlaceTypeCreatedEvent)
export class PlaceTypeCreatedEventHandler implements IEventHandler<PlaceTypeCreatedEvent> {
  private readonly logger = new Logger(PlaceTypeCreatedEventHandler.name);

  handle(event: PlaceTypeCreatedEvent) {
    this.logger.log(`Place type created: ${event.id}`);
  }
}
