export class SearchItemReadModel {
  constructor(
    public readonly parkingId: string,
    public readonly name: string,
    public readonly features: { name: string }[],
    public readonly featureIds: string[],
    public readonly order: number,
    public readonly hasAvailableParkingSpots: boolean,
    public readonly assetIds: string[],
    public readonly active: boolean,
    public readonly placeId: string,
    public readonly longitude: number,
    public readonly latitude: number,
    public readonly distance: number,
  ) {}
}
