import { ICommand } from '@nestjs/cqrs';

export class UpdatePlaceCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly placeTypeId: string,
    public readonly address: string,
    public readonly version: number,
  ) {}
}
