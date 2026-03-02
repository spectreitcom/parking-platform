import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ParkingAddonCreatedEvent } from '../../domain/events/parking-addon-created.event';

@EventsHandler(ParkingAddonCreatedEvent)
export class ParkingAddonCreatedEventHandler implements IEventHandler<ParkingAddonCreatedEvent> {
  private readonly logger = new Logger(ParkingAddonCreatedEventHandler.name);

  handle(event: ParkingAddonCreatedEvent) {
    this.logger.log(`Parking addon created: ${event.id}`);
  }
}
