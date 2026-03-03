import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

export class OwnerId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid OwnerId`);
    }
  }

  static create() {
    return new OwnerId(randomUUID());
  }

  static fromString(value: string) {
    return new OwnerId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: OwnerId) {
    return this._value === other._value;
  }
}
