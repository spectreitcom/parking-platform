import { IsInt, Min, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class Money {
  @IsInt()
  @Min(0)
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid Money`);
    }
  }

  static fromNumber(value: number) {
    return new Money(value);
  }

  get value() {
    return this._value;
  }

  toPLN() {
    return this._value / 100;
  }

  add(other: Money) {
    return new Money(this._value + other._value);
  }

  subtract(other: Money) {
    return new Money(this._value - other._value);
  }

  equals(other: Money) {
    return this._value === other._value;
  }
}
