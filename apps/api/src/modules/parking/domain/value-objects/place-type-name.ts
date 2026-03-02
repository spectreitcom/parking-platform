import { IsNotEmpty, MaxLength, validateSync } from 'class-validator';

export class PlaceTypeName {
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
      throw new Error(`Invalid PlaceTypeName`);
    }
  }

  get value() {
    return this._value;
  }

  static fromString(value: string) {
    return new PlaceTypeName(value);
  }

  equals(other: PlaceTypeName) {
    return this._value === other._value;
  }
}
