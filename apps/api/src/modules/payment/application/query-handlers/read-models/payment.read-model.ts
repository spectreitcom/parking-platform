export class PaymentReadModel {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly createdAt: Date,
    public readonly paidAt: Date | null,
  ) {}
}
