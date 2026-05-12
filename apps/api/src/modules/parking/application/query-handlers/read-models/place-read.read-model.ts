export class PlaceReadReadModel {
  constructor(
    public readonly placeId: string,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly placeTypeId: string,
    public readonly placeTypeName: string,
    public readonly address: string,
    public readonly active: boolean,
    public readonly version: number,
  ) {}
}
