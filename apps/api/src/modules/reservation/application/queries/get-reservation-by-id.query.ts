import { IQuery } from '@nestjs/cqrs';
import { IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetReservationByIdQuery implements IQuery {
  @IsUUID()
  readonly reservationId: string;

  constructor(reservationId: string) {
    this.reservationId = reservationId;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length) {
      throw new AppError('VALIDATION_ERROR', 'Invalid GetReservationByIdQuery');
    }
  }
}
