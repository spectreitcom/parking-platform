import { IsUUID, validateSync } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class ParkingTypeId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(`Invalid ParkingTypeId`);
    }
  }

  static create() {
    return new ParkingTypeId(randomUUID());
  }

  static fromString(value: string) {
    return new ParkingTypeId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: ParkingTypeId) {
    return this._value === other._value;
  }
}
