import { IEvent } from '@nestjs/cqrs';

export class ParkingSpotDeactivatedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
