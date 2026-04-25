import { IsIn, IsNotEmpty, validateSync } from 'class-validator';
import {
  RESERVATION_CANCELLED,
  RESERVATION_CREATED,
  RESERVATION_PAID,
} from 'src/modules/reservation/domain/constants';
import { AppError } from 'src/shared/errors';

export class ReservationStatus {
  @IsNotEmpty()
  @IsIn([RESERVATION_CREATED, RESERVATION_PAID, RESERVATION_CANCELLED])
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid ReservationStatus');
    }
  }

  static fromString(value: string) {
    return new ReservationStatus(value);
  }

  static created() {
    return new ReservationStatus(RESERVATION_CREATED);
  }

  static paid() {
    return new ReservationStatus(RESERVATION_PAID);
  }

  static cancelled() {
    return new ReservationStatus(RESERVATION_CANCELLED);
  }

  get value() {
    return this._value;
  }

  equals(other: ReservationStatus) {
    return this._value === other._value;
  }
}
