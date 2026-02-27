import { ICommand } from '@nestjs/cqrs';

export class DeleteParkingAddonCommand implements ICommand {
  constructor(public readonly id: string) {}
}
