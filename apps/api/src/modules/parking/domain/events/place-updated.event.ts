import { IEvent } from '@nestjs/cqrs';

export class PlaceUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly placeTypeId: string,
    public readonly active: boolean,
    public readonly address: string,
    public readonly version: number,
  ) {}
}
