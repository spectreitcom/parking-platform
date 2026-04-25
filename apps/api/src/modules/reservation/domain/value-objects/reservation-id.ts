import { IsUUID, validateSync } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { AppError } from 'src/shared/errors';

export class ReservationId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid ReservationId');
    }
  }

  static create() {
    return new ReservationId(randomUUID());
  }

  static fromString(value: string) {
    return new ReservationId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: ReservationId) {
    return this._value === other._value;
  }
}
