import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

export class OrganizationMemberId {
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
        'Invalid organization member ID format',
      );
    }
  }

  static create() {
    return new OrganizationMemberId(randomUUID());
  }

  static fromString(value: string) {
    return new OrganizationMemberId(value);
  }

  get value() {
    return this._value;
  }

  equals(id: OrganizationMemberId) {
    return this._value === id.value;
  }
}
