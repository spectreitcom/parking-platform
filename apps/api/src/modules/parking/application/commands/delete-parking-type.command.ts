import { ICommand } from '@nestjs/cqrs';

export class DeleteParkingTypeCommand implements ICommand {
  constructor(public readonly id: string) {}
}
