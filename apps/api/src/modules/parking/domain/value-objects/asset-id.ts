import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

export class AssetId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid AssetId`);
    }
  }

  static create() {
    return new AssetId(randomUUID());
  }

  static fromString(value: string) {
    return new AssetId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: AssetId) {
    return this._value === other._value;
  }
}
