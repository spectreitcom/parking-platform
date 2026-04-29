export class ParkingItemReadModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly longitude: number,
    public readonly latitude: number,
    public readonly statute: string | null,
    public readonly description: string | null,
    public readonly organizationId: string,
    public readonly assetIds: string[],
    public readonly parkingFeatureIds: string[],
    public readonly parkingAddonIds: string[],
    public readonly placeId: string,
    public readonly active: boolean,
    public readonly address: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly version: number,
  ) {}
}
