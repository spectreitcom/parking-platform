import { IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class ParkingSpotId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid ParkingSpotId');
    }
  }

  static fromString(value: string) {
    return new ParkingSpotId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: ParkingSpotId) {
    return this._value === other._value;
  }
}
