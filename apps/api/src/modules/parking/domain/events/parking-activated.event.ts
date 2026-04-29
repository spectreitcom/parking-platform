import { IEvent } from '@nestjs/cqrs';

export class ParkingActivatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly version: number,
    public readonly updatedAt: Date,
  ) {}
}
