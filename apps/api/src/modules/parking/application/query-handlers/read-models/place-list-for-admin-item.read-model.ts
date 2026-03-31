export class PlaceListForAdminItemReadModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly active: boolean,
    public readonly placeTypeName: string,
    public readonly version: number,
  ) {}
}
