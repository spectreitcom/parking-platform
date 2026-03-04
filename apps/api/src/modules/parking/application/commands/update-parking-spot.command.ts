import { ICommand } from '@nestjs/cqrs';

export class UpdateParkingSpotCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly price: number,
    public readonly parkingSpotFeatureIds: string[],
    public readonly version: number,
  ) {}
}
