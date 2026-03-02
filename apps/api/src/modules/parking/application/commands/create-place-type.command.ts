import { ICommand } from '@nestjs/cqrs';

export class CreatePlaceTypeCommand implements ICommand {
  constructor(public readonly name: string) {}
}
