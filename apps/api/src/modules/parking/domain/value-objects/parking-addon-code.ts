import { IsNotEmpty, validateSync } from 'class-validator';

export class ParkingAddonCode {
  @IsNotEmpty()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(`Invalid ParkingAddonCode`);
    }
  }

  get value() {
    return this._value;
  }

  static fromString(value: string) {
    return new ParkingAddonCode(value);
  }

  equals(other: ParkingAddonCode) {
    return this._value === other._value;
  }
}
