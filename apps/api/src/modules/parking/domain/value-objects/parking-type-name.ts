import { IsNotEmpty, MaxLength, validateSync } from 'class-validator';

export class ParkingTypeName {
  @IsNotEmpty()
  @MaxLength(60)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.trim().replace(/\s+/g, ' ');
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(`Invalid ParkingTypeName`);
    }
  }

  get value() {
    return this._value;
  }

  static fromString(value: string) {
    return new ParkingTypeName(value);
  }

  equals(other: ParkingTypeName) {
    return this._value === other._value;
  }
}
