import { IQuery } from '@nestjs/cqrs';
import { IsArray, IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetPaymentsByReservationIdsQuery implements IQuery {
  @IsArray()
  @IsUUID('4', { each: true })
  readonly reservationIds: string[];

  constructor(reservationIds: string[]) {
    this.reservationIds = reservationIds;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetPaymentsByReservationIdsQuery',
      );
    }
  }
}
