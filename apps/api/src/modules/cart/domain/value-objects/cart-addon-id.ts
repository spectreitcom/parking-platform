import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class CartAddonId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid CartAddonId');
    }
  }

  static fromString(value: string) {
    return new CartAddonId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: CartAddonId) {
    return this.value === other.value;
  }
}
