import { ICommand } from '@nestjs/cqrs';

export class CreateParkingSpotCommand implements ICommand {
  constructor(
    public readonly parkingId: string,
    public readonly price: number,
    public readonly parkingSpotFeatureIds: string[],
    public readonly parkingOwnerId: string,
  ) {}
}
