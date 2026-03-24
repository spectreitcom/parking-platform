export class PlaceTypeUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly version: number,
  ) {}
}
