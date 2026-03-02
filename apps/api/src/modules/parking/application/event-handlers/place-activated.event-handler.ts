import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceActivatedEvent } from '../../domain/events/place-activated.event';

@EventsHandler(PlaceActivatedEvent)
export class PlaceActivatedEventHandler implements IEventHandler<PlaceActivatedEvent> {
  private readonly logger = new Logger(PlaceActivatedEventHandler.name);

  handle(event: PlaceActivatedEvent) {
    this.logger.log(`Place activated: ${event.id}`);
  }
}
