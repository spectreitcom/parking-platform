import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ParkingAddonDeletedEvent } from '../../domain/events/parking-addon-deleted.event';
import { Logger } from '@nestjs/common';

@EventsHandler(ParkingAddonDeletedEvent)
export class ParkingAddonDeletedEventHandler implements IEventHandler<ParkingAddonDeletedEvent> {
  private readonly logger = new Logger(ParkingAddonDeletedEventHandler.name);

  handle(event: ParkingAddonDeletedEvent) {
    this.logger.log(`Parking addon deleted: ${event.id}`);
    // tutaj logika, która z aktualizuje read modele
  }
}
