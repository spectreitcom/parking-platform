import { ICommand } from '@nestjs/cqrs';

export class UpdateParkingForManagerCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly assetIds: string[],
    public readonly parkingFeatureIds: string[],
    public readonly parkingAddonIds: string[],
    public readonly description: string,
    public readonly statute: string,
    public readonly version: number,
  ) {}
}
