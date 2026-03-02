import { ICommand } from '@nestjs/cqrs';

export class CreatePlaceCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly placeTypeId: string,
    public readonly active: boolean,
    public readonly address: string,
  ) {}
}
