import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class OrganizationUserId {
  @IsUUID()
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
        'Invalid organization user ID format',
      );
    }
  }

  static fromString(value: string) {
    return new OrganizationUserId(value);
  }

  get value() {
    return this._value;
  }

  equals(id: OrganizationUserId) {
    return this._value === id.value;
  }
}
