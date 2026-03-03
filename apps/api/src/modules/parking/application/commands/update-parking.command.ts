import { ICommand } from '@nestjs/cqrs';

export class UpdateParkingCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly longitude: number,
    public readonly latitude: number,
    public readonly placeId: string,
    public readonly assetIds: string[],
    public readonly parkingFeatureIds: string[],
    public readonly parkingAddonIds: string[],
    public readonly description: string,
    public readonly statue: string,
    public readonly version: number,
  ) {}
}
