import { IQuery } from '@nestjs/cqrs';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { MAX_PAGE_SIZE } from 'src/shared/constants';

export class GetParkingSpotsByParkingIdQuery implements IQuery {
  @IsUUID()
  readonly parkingId: string;

  @IsInt()
  @Min(1)
  public readonly page: number;

  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  public readonly limit: number;

  constructor(parkingId: string, page: number, limit: number) {
    this.parkingId = parkingId;
    this.page = page;
    this.limit = limit;
  }
}
