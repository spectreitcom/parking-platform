import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

export class ParkingId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid ParkingId`);
    }
  }

  static create() {
    return new ParkingId(randomUUID());
  }

  static fromString(value: string) {
    return new ParkingId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ParkingId) {
    return this._value === other._value;
  }
}
