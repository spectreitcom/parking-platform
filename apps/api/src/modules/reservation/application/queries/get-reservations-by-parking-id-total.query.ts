import { IQuery } from '@nestjs/cqrs';
import { IsOptional, IsString, IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetReservationsByParkingIdTotalQuery implements IQuery {
  @IsUUID()
  readonly parkingId: string;

  @IsOptional()
  @IsString()
  readonly search?: string;

  constructor(parkingId: string, search?: string) {
    this.parkingId = parkingId;
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
