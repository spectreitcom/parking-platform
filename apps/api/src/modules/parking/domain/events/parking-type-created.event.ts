export class ParkingTypeCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}
