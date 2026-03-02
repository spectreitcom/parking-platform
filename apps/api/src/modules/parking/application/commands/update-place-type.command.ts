import { ICommand } from '@nestjs/cqrs';

export class UpdatePlaceTypeCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly version: number,
  ) {}
}
