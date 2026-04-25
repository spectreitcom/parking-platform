import { IEvent } from '@nestjs/cqrs';

export class ReservationCreatedEvent implements IEvent {
  constructor(
    public readonly reservationId: string,
    public readonly cartId: string,
    public readonly parkingSpotId: string,
    public readonly userId: string,
    public readonly startDate: number,
    public readonly endDate: number,
    public readonly lines: { title: string; price: number }[],
    public readonly total: number,
    public readonly version: number,
    public readonly status: string,
    public readonly registrationNumber: string,
    public readonly addons: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
