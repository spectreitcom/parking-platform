import { IEvent } from '@nestjs/cqrs';

export class PlaceDeactivatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly version: number,
  ) {}
}
