import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingFeatureUpdatedEvent } from '../../domain/events/parking-feature-updated.event';

@EventsHandler(ParkingFeatureUpdatedEvent)
export class ParkingFeatureUpdatedEventHandler implements IEventHandler<ParkingFeatureUpdatedEvent> {
  private readonly logger = new Logger(ParkingFeatureUpdatedEventHandler.name);

  handle(event: ParkingFeatureUpdatedEvent) {
    this.logger.log(`Parking feature updated: ${event.id}`);
  }
}
