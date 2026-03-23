import { IEvent } from '@nestjs/cqrs';

export class ParkingAddonCreatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly price: number,
    public readonly version: number,
  ) {}
}
