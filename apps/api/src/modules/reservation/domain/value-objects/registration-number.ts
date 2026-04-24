import { IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class RegistrationNumber {
  @IsString()
  @MaxLength(20)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid RegistrationNumber');
    }
  }

  static fromString(value: string) {
    return new RegistrationNumber(value);
  }

  get value() {
    return this._value;
  }

  equals(other: RegistrationNumber) {
    return this._value === other._value;
  }
}
