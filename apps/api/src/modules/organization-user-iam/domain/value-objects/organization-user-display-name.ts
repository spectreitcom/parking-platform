import { IsNotEmpty, IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class OrganizationUserDisplayName {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
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
        'Invalid organization user display name format.',
      );
    }
  }

  static fromString(value: string) {
    return new OrganizationUserDisplayName(value);
  }

  get value(): string {
    return this._value;
  }

  equals(name: OrganizationUserDisplayName) {
    return this._value === name.value;
  }
}
