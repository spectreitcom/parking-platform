import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotActivatedEvent } from '../../domain/events/parking-spot-activated.event';

@EventsHandler(ParkingSpotActivatedEvent)
export class ParkingSpotActivatedEventHandler implements IEventHandler<ParkingSpotActivatedEvent> {
  private readonly logger = new Logger(ParkingSpotActivatedEventHandler.name);

  handle(event: ParkingSpotActivatedEvent) {
    this.logger.log(`Parking spot activated: ${event.id}`);
  }
}
