import { IQuery } from '@nestjs/cqrs';

export class GetParkingSpotByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
