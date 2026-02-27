import { ICommand } from '@nestjs/cqrs';

export class UpdateParkingAddonCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
  ) {}
}
