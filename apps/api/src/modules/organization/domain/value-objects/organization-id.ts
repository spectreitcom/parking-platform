import { randomUUID } from 'node:crypto';
import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class OrganizationId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length) {
      throw new AppError('VALIDATION_ERROR', 'Invalid organization ID format');
    }
  }

  static create() {
    return new OrganizationId(randomUUID());
  }

  static fromString(value: string) {
    return new OrganizationId(value);
  }

  get value() {
    return this._value;
  }

  equals(id: OrganizationId) {
    return this._value === id.value;
  }
}
