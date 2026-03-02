export class PlaceTypeCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}
