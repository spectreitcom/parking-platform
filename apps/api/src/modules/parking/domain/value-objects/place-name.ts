import { IsNotEmpty, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class PlaceName {
  @IsNotEmpty()
  @MaxLength(255)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.trim().replace(/\s+/g, ' ');
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid PlaceName`);
    }
  }

  get value() {
    return this._value;
  }

  static fromString(value: string) {
    return new PlaceName(value);
  }

  equals(other: PlaceName) {
    return this._value === other._value;
  }
}
