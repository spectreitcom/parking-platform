import { ICommand } from '@nestjs/cqrs';

export class ActivatePlaceCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly version: number,
  ) {}
}
