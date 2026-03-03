import { ICommand } from '@nestjs/cqrs';

export class UpdateParkingFeatureCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly levels: string[],
    public readonly version: number,
  ) {}
}
