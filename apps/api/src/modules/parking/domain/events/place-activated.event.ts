import { IEvent } from '@nestjs/cqrs';

export class PlaceActivatedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
