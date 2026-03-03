import { IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class ParkingFeatureName {
  @IsString()
  @MaxLength(255)
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid ParkingFeatureName`);
    }
  }

  get value(): string {
    return this._value;
  }

  static fromString(value: string): ParkingFeatureName {
    return new ParkingFeatureName(value);
  }

  equals(other: ParkingFeatureName): boolean {
    return this._value === other._value;
  }
}
