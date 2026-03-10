export class ParkingListForAdminItemReadModel {
  constructor(
    public readonly id: string,
    public readonly organization: { id: string; name: string },
    public readonly place: { id: string; name: string },
    public readonly name: string,
    public readonly active: boolean,
    public readonly spotsNumber: number,
    public readonly address: string,
  ) {}
}
