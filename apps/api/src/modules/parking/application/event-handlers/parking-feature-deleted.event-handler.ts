import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingFeatureDeletedEvent } from '../../domain/events/parking-feature-deleted.event';

@EventsHandler(ParkingFeatureDeletedEvent)
export class ParkingFeatureDeletedEventHandler implements IEventHandler<ParkingFeatureDeletedEvent> {
  private readonly logger = new Logger(ParkingFeatureDeletedEventHandler.name);

  handle(event: ParkingFeatureDeletedEvent) {
    this.logger.log(`Parking feature deleted: ${event.id}`);
  }
}
