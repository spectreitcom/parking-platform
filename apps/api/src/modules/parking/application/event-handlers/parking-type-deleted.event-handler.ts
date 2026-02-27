import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ParkingTypeDeletedEvent } from '../../domain/events/parking-type-deleted.event';
import { Logger } from '@nestjs/common';

@EventsHandler(ParkingTypeDeletedEvent)
export class ParkingTypeDeletedEventHandler implements IEventHandler<ParkingTypeDeletedEvent> {
  private readonly logger = new Logger(ParkingTypeDeletedEventHandler.name);

  handle(event: ParkingTypeDeletedEvent) {
    this.logger.log(`ParkingTypeDeletedEvent: ${JSON.stringify(event)}`);
    // tutaj powinien być kod aktualizujący read modele
  }
}
