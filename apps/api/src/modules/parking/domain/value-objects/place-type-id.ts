import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

export class PlaceTypeId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid PlaceTypeId`);
    }
  }

  static create() {
    return new PlaceTypeId(randomUUID());
  }

  static fromString(value: string) {
    return new PlaceTypeId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: PlaceTypeId) {
    return this._value === other._value;
  }
}
