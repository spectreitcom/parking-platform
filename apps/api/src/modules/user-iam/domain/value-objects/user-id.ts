import { IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

export class UserId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid UserId');
    }
  }

  static create() {
    return new UserId(randomUUID());
  }

  static fromString(value: string) {
    return new UserId(value);
  }

  get value(): string {
    return this._value;
  }
}
