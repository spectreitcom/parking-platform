import { IsNotEmpty, MaxLength, validateSync } from 'class-validator';

export class ParkingAddonName {
  @IsNotEmpty()
  @MaxLength(255)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.trim().replace(/\s+/g, ' ');
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(`Invalid ParkingAddonName`);
    }
  }

  get value() {
    return this._value;
  }

  static fromString(value: string) {
    return new ParkingAddonName(value);
  }

  equals(other: ParkingAddonName) {
    return this._value === other._value;
  }
}
