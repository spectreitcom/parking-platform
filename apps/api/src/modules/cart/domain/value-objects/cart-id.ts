import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

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

  static create() {
    return new CartId(randomUUID());
  }

  static fromString(value: string) {
    return new CartId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: CartId) {
    return this.value === other.value;
  }
}
