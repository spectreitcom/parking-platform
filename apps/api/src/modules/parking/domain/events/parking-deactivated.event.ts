import { IEvent } from '@nestjs/cqrs';

export class ParkingDeactivatedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
