import { ICommand } from '@nestjs/cqrs';

export class DeactivateParkingCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly version: number,
  ) {}
}
