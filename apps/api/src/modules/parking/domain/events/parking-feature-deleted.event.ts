import { IEvent } from '@nestjs/cqrs';

export class ParkingFeatureDeletedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
