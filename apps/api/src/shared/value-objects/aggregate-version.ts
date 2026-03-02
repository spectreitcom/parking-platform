import { IsInt, Min, validateSync } from 'class-validator';

export class AggregateVersion {
  @IsInt()
  @Min(1)
  private readonly _value: number;

  constructor(value: number) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error('Invalid aggregate version');
    }
  }

  static fromNumber(value: number): AggregateVersion {
    return new AggregateVersion(value);
  }

  static one(): AggregateVersion {
    return new AggregateVersion(1);
  }

  get value(): number {
    return this._value;
  }

  equals(other: AggregateVersion): boolean {
    return this.value === other.value;
  }
}
