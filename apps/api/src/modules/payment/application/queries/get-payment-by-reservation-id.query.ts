import { IQuery } from '@nestjs/cqrs';

export class GetPaymentByReservationIdQuery implements IQuery {
  constructor(public readonly reservationId: string) {}
}
