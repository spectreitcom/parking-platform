import { IEvent } from '@nestjs/cqrs';

export class ParkingUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly placeId: string,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly parkingFeatureIds: string[],
    public readonly parkingAddonIds: string[],
    public readonly active: boolean,
    public readonly assetIds: string[],
    public readonly description: string,
    public readonly statute: string,
  ) {}
}
