import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotCreatedEvent } from '../../domain/events/parking-spot-created.event';

@EventsHandler(ParkingSpotCreatedEvent)
export class ParkingSpotCreatedEventHandler implements IEventHandler<ParkingSpotCreatedEvent> {
  private readonly logger = new Logger(ParkingSpotCreatedEventHandler.name);

  handle(event: ParkingSpotCreatedEvent) {
    this.logger.log(`Parking spot created: ${event.id}`);
  }
}
