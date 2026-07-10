import { IQuery } from '@nestjs/cqrs';
import { IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetReservationDetailsQuery implements IQuery {
  @IsUUID()
  readonly reservationId: string;

  @IsUUID()
  readonly userId: string;

  constructor(reservationId: string, userId: string) {
    this.reservationId = reservationId;
    this.userId = userId;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetReservationDetailsQuery',
      );
    }
  }
}
