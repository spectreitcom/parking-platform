export class ReservationListItemReadModel {
  constructor(
    public readonly id: string,
    public readonly registrationNumber: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userId: string,
  ) {}
}
