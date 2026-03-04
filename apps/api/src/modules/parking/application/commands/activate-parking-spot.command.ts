import { ICommand } from '@nestjs/cqrs';

export class ActivateParkingSpotCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly version: number,
    public readonly parkingOwnerId: string,
  ) {}
}
