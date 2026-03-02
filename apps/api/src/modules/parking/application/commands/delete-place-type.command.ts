import { ICommand } from '@nestjs/cqrs';

export class DeletePlaceTypeCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly version: number,
  ) {}
}
