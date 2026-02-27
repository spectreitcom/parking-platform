import { ICommand } from '@nestjs/cqrs';

export class CreateParkingAddonCommand implements ICommand {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly price: number,
  ) {}
}
