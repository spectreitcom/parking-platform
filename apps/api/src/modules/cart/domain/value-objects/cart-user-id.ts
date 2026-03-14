import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class CartUserId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid CartUserId');
    }
  }

  static fromString(value: string) {
    return new CartUserId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: CartUserId) {
    return this.value === other.value;
  }
}
