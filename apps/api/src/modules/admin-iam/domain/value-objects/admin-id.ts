import { IsUUID, validateSync } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../shared/errors';

export class AdminId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid AdminId');
    }
  }

  static create() {
    return new AdminId(randomUUID());
  }

  static fromString(value: string) {
    return new AdminId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: AdminId) {
    return this._value === other._value;
  }
}
