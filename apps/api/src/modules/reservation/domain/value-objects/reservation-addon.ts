import { IsIn, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';
import { ADDON_CAN_CANCEL_15_MINUTES_BEFORE } from 'src/modules/reservation/domain/constants';

export class ReservationAddon {
  @IsIn([ADDON_CAN_CANCEL_15_MINUTES_BEFORE])
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  static fromString(value: string) {
    return new ReservationAddon(value);
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid ReservationAddon');
    }
  }

  get value() {
    return this._value;
  }

  static canCancel15MinutesBefore() {
    return new ReservationAddon(ADDON_CAN_CANCEL_15_MINUTES_BEFORE);
  }

  equals(other: ReservationAddon) {
    return this._value === other._value;
  }
}
