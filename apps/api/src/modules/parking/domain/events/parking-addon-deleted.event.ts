import { IEvent } from '@nestjs/cqrs';

export class ParkingAddonDeletedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
