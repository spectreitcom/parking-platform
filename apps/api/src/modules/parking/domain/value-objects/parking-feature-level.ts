import { IsIn, IsString, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { PARKING_LEVEL, PARKING_SPOT_LEVEL } from '../constants';

export class ParkingFeatureLevel {
  @IsString()
  @IsIn([PARKING_LEVEL, PARKING_SPOT_LEVEL])
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid ParkingFeatureLevel`);
    }
  }

  get value() {
    return this._value;
  }

  static fromString(value: string) {
    return new ParkingFeatureLevel(value);
  }

  static parkingLevel() {
    return new ParkingFeatureLevel(PARKING_LEVEL);
  }

  static parkingSpotLevel() {
    return new ParkingFeatureLevel(PARKING_SPOT_LEVEL);
  }

  static fromArray(_values: string[]) {
    if (_values.length === 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'ParkingFeatureLevel must contain at least one level',
      );
    }
    return _values.map((value) => new ParkingFeatureLevel(value));
  }

  equals(other: ParkingFeatureLevel) {
    return this._value === other._value;
  }
}
