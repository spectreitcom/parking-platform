import { IQuery } from '@nestjs/cqrs';

export class GetParkingByParkingSpotIdQuery implements IQuery {
  constructor(public readonly parkingSpotId: string) {}
}
