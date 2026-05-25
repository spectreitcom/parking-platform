export class ParkingForManagerItemReadModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly active: boolean,
    public readonly placeId: string,
    public readonly version: number,
  ) {}
}
