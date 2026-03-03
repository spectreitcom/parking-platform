import { ICommand } from '@nestjs/cqrs';

export class ActivateParkingCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly version: number,
  ) {}
}
