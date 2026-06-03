import { IsMimeType, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class AssetMimeType {
  @IsMimeType()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid AssetMimeType');
    }
  }

  get value() {
    return this._value;
  }

  static fromString(value: string) {
    return new AssetMimeType(value);
  }

  equals(other: AssetMimeType) {
    return this._value === other._value;
  }
}
