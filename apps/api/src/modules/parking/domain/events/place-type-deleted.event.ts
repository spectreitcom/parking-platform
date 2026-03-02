import { IEvent } from '@nestjs/cqrs';

export class PlaceTypeDeletedEvent implements IEvent {
  constructor(public readonly id: string) {}
}
