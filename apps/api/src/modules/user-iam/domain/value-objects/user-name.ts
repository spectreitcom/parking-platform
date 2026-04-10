import { IsNotEmpty, IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class UserName {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.trim();
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid UserName');
    }
  }

  static fromString(value: string) {
    return new UserName(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserName) {
    return this.value === other.value;
  }
}
