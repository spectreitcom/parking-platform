import { ICommand } from '@nestjs/cqrs';

export class CreateReservationCommand implements ICommand {
  constructor(
    public readonly cartId: string,
    public readonly userId: string,
    public readonly parkingId: string,
    public readonly parkingSpotId: string,
    public readonly startDate: number,
    public readonly endDate: number,
    public readonly registrationNumber: string,
    public readonly lines: { title: string; price: number }[],
    public readonly addons: string[],
  ) {}
}
