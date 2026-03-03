import { IEvent } from '@nestjs/cqrs';

export class ParkingFeatureUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly levels: string[],
  ) {}
}
