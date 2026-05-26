export class ParkingSpotReadReadModel {
  constructor(
    public readonly id: string,
    public readonly parkingId: string,
    public readonly price: number,
    public readonly pricePLN: number,
    public readonly active: boolean,
    public readonly parkingSpotFeatureIds: string[],
    public readonly version: number,
    public readonly organizationId: string,
  ) {}
}
