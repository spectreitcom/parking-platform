export class ParkingAddonReadModel {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly price: number,
    public readonly priceInPln: number,
    public readonly version: number,
  ) {}
}
