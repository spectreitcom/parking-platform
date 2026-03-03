import { ICommand } from '@nestjs/cqrs';

export class DeleteParkingFeatureCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly version: number,
  ) {}
}
