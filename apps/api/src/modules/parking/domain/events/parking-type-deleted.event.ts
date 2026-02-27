import { IEvent } from '@nestjs/cqrs';

export class ParkingTypeDeletedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
