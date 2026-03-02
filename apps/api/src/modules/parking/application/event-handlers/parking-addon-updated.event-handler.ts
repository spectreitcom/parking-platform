import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingAddonUpdatedEvent } from '../../domain/events/parking-addon-updated.event';

@EventsHandler(ParkingAddonUpdatedEvent)
export class ParkingAddonUpdatedEventHandler implements IEventHandler<ParkingAddonUpdatedEvent> {
  private readonly logger = new Logger(ParkingAddonUpdatedEventHandler.name);

  handle(event: ParkingAddonUpdatedEvent) {
    this.logger.log(`Parking addon updated: ${event.id}`);
  }
}
