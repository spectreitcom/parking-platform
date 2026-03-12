import { IsNotEmpty, IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class OrganizationName {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid organization name format.',
      );
    }
  }

  static fromString(value: string) {
    return new OrganizationName(value);
  }

  get value(): string {
    return this._value;
  }

  equals(name: OrganizationName) {
    return this._value === name.value;
  }
}
