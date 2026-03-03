import { IEvent } from '@nestjs/cqrs';

export class ParkingActivatedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
