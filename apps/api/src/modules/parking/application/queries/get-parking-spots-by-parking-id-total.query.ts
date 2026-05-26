import { IQuery } from '@nestjs/cqrs';
import { IsUUID } from 'class-validator';

export class GetParkingSpotsByParkingIdTotalQuery implements IQuery {
  @IsUUID()
  readonly parkingId: string;

  constructor(parkingId: string) {
    this.parkingId = parkingId;
  }
}
