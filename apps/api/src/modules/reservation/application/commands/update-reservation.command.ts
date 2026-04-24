import { ICommand } from '@nestjs/cqrs';

export class UpdateReservationCommand implements ICommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly version: number,
    public readonly registrationNumber: string,
  ) {}
}
