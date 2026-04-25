import { IEvent } from '@nestjs/cqrs';

export class ReservationCancelledEvent implements IEvent {
  constructor(
    public readonly reservationId: string,
    public readonly version: number,
    public readonly status: string,
    public readonly updatedAt: Date,
  ) {}
}
