export class ParkingAddonListForAdminItemReadModel {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly priceInPln: number,
    public readonly version: number,
  ) {}
}
