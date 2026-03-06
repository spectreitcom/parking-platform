import { IsEmail, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../errors';

export class Email {
  @IsEmail()
  @MaxLength(255)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid email');
    }
  }

  static fromString(value: string) {
    return new Email(value);
  }

  get value() {
    return this._value;
  }

  equals(other: Email) {
    return this.value === other.value;
  }
}
