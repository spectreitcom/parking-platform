import { IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class CartId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid CartId');
    }
  }

  static fromString(value: string) {
    return new CartId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: CartId) {
    return this._value === other._value;
  }
}
