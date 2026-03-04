import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotUpdatedEvent } from '../../domain/events/parking-spot-updated.event';

@EventsHandler(ParkingSpotUpdatedEvent)
export class ParkingSpotUpdatedEventHandler implements IEventHandler<ParkingSpotUpdatedEvent> {
  private readonly logger = new Logger(ParkingSpotUpdatedEventHandler.name);

  handle(event: ParkingSpotUpdatedEvent) {
    this.logger.log(`Parking spot updated: ${event.id}`);
  }
}
