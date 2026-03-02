import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlaceDeactivatedEvent } from '../../domain/events/place-deactivated.event';

@EventsHandler(PlaceDeactivatedEvent)
export class PlaceDeactivatedEventHandler implements IEventHandler<PlaceDeactivatedEvent> {
  private readonly logger = new Logger(PlaceDeactivatedEventHandler.name);

  handle(event: PlaceDeactivatedEvent) {
    this.logger.log(`Place deactivated: ${event.id}`);
  }
}
