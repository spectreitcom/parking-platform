import { IsUUID, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { randomUUID } from 'node:crypto';

export class OrganizationId {
  @IsUUID()
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.toLowerCase();
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid OrganizationId`);
    }
  }

  static create() {
    return new OrganizationId(randomUUID());
  }

  static fromString(value: string) {
    return new OrganizationId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: OrganizationId) {
    return this._value === other._value;
  }
}
