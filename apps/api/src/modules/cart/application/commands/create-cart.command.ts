import { ICommand } from '@nestjs/cqrs';

export class CreateCartCommand implements ICommand {
  constructor(
    public readonly parkingSpotId: string,
    public readonly arrival: number,
    public readonly departure: number,
    public readonly pricePerDay: number,
    public readonly userId?: string,
  ) {}
}
