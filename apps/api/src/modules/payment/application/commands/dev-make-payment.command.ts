import { ICommand } from '@nestjs/cqrs';

export class DevMakePaymentCommand implements ICommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
  ) {}
}
