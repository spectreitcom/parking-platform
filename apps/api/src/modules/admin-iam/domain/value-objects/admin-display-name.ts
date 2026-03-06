import { IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class AdminDisplayName {
  @IsString()
  @MaxLength(120)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid AdminDisplayName');
    }
  }

  static fromString(value: string) {
    return new AdminDisplayName(value);
  }

  get value() {
    return this._value;
  }

  equals(other: AdminDisplayName) {
    return this._value === other._value;
  }
}
