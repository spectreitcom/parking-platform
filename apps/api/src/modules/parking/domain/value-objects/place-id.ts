import { IsUUID, validateSync } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class PlaceId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(`Invalid PlaceId`);
    }
  }

  static create() {
    return new PlaceId(randomUUID());
  }

  static fromString(value: string) {
    return new PlaceId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: PlaceId) {
    return this._value === other._value;
  }
}
