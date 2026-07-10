export class ReservationReadModel {
  constructor(
    public readonly reservationId: string,
    public readonly cartId: string,
    public readonly parkingSpotId: string,
    public readonly parkingId: string,
    public readonly userId: string,
    public readonly arrival: number,
    public readonly departure: number,
    public readonly lines: { title: string; price: number }[],
    public readonly total: number,
    public readonly status: string,
    public readonly registrationNumber: string,
    public readonly version: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
