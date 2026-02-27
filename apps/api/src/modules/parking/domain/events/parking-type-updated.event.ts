export class ParkingTypeUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}
