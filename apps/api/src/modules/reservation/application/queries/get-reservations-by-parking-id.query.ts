import { IQuery } from '@nestjs/cqrs';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';
import { MAX_PAGE_SIZE } from 'src/shared/constants';

export class GetReservationsByParkingIdQuery implements IQuery {
  @IsUUID()
  readonly parkingId: string;

  @IsNumber()
  @IsInt()
  @Min(1)
  readonly page: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly limit: number;

  @IsOptional()
  @IsString()
  readonly search?: string;

  constructor(parkingId: string, page: number, limit: number, search?: string) {
    this.parkingId = parkingId;
    this.page = page;
    this.limit = limit;
    this.search = search;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetReservationsByParkingIdQuery',
      );
    }
  }
}
