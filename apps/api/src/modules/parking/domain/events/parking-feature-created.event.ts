import { IEvent } from '@nestjs/cqrs';

export class ParkingFeatureCreatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly levels: string[],
    public readonly version: number,
  ) {}
}
