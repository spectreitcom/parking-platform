import { randomUUID } from 'node:crypto';
import { IsUUID, validateSync } from 'class-validator';

export class ParkingAddonId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(`Invalid ParkingAddonId`);
    }
  }

  static create() {
    return new ParkingAddonId(randomUUID());
  }

  static fromString(value: string) {
    return new ParkingAddonId(value);
  }

  get value() {
    return this._value;
  }

  equals(other: ParkingAddonId) {
    return this._value === other._value;
  }
}
