import { ICommand } from '@nestjs/cqrs';

export class CreateParkingFeatureCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly levels: string[],
  ) {}
}
