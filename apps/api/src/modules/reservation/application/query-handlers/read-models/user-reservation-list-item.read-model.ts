export class UserReservationListItemReadModel {
  constructor(
    public readonly id: string,
    public readonly registrationNumber: string,
    public readonly parkingSpotId: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly arrivalDate: Date,
    public readonly departureDate: Date,
    public readonly version: number,
    public readonly canCancel: boolean,
    public readonly canEdit: boolean,
    public readonly parkingId: string,
  ) {}
}
