import { ICommand } from '@nestjs/cqrs';

export class CreateParkingCommand implements ICommand {
  constructor(
    public readonly organizationId: string,
    public readonly name: string,
    public readonly address: string,
    public readonly longitude: number,
    public readonly latitude: number,
    public readonly placeId: string,
  ) {}
}
