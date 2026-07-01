import { IQuery } from '@nestjs/cqrs';
import {
  IsInt,
  IsNotEmpty,
  IsUUID,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';

export class CalculatePriceForParkingQuery implements IQuery {
  @IsNotEmpty()
  @IsUUID()
  readonly parkingId: string;

  @Max(15)
  @Min(1)
  @IsInt()
  readonly days: number;

  constructor(parkingId: string, days: number) {
    this.parkingId = parkingId;
    this.days = days;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid CalculatePriceForParkingSpotQuery',
      );
    }
  }
}
