import { IEvent } from '@nestjs/cqrs';

export class ParkingSpotActivatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly version: number,
  ) {}
}
