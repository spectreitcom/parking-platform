import { ICommand } from '@nestjs/cqrs';

export class CreateParkingTypeCommand implements ICommand {
  constructor(public readonly name: string) {}
}
