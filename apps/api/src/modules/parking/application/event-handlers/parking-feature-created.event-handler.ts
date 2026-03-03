import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingFeatureCreatedEvent } from '../../domain/events/parking-feature-created.event';

@EventsHandler(ParkingFeatureCreatedEvent)
export class ParkingFeatureCreatedEventHandler implements IEventHandler<ParkingFeatureCreatedEvent> {
  private readonly logger = new Logger(ParkingFeatureCreatedEventHandler.name);

  handle(event: ParkingFeatureCreatedEvent) {
    this.logger.log(`Parking feature created: ${event.id}`);
  }
}
