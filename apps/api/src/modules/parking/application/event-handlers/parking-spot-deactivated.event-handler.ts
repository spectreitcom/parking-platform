import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingSpotDeactivatedEvent } from '../../domain/events/parking-spot-deactivated.event';

@EventsHandler(ParkingSpotDeactivatedEvent)
export class ParkingSpotDeactivatedEventHandler implements IEventHandler<ParkingSpotDeactivatedEvent> {
  private readonly logger = new Logger(ParkingSpotDeactivatedEventHandler.name);

  handle(event: ParkingSpotDeactivatedEvent) {
    this.logger.log(`Parking spot deactivated: ${event.id}`);
  }
}
