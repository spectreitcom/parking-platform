import { IEvent } from '@nestjs/cqrs';

export class ParkingSpotCreatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly parkingId: string,
    public readonly price: number,
    public readonly active: boolean,
    public readonly parkingSpotFeatureIds: string[],
  ) {}
}
