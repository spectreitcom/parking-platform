import { IsIn, validateSync } from 'class-validator';
import {
  ORGANIZATION_USER_ACTIVE,
  ORGANIZATION_USER_INVITED,
  ORGANIZATION_USER_SUSPENDED,
} from '../constants';
import { AppError } from '../../../../shared/errors';

export class OrganizationUserStatus {
  @IsIn([
    ORGANIZATION_USER_INVITED,
    ORGANIZATION_USER_SUSPENDED,
    ORGANIZATION_USER_ACTIVE,
  ])
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid OrganizationUserStatus');
    }
  }

  static invited() {
    return new OrganizationUserStatus(ORGANIZATION_USER_INVITED);
  }

  static suspended() {
    return new OrganizationUserStatus(ORGANIZATION_USER_SUSPENDED);
  }

  static active() {
    return new OrganizationUserStatus(ORGANIZATION_USER_ACTIVE);
  }

  static fromString(value: string) {
    return new OrganizationUserStatus(value);
  }

  get value() {
    return this._value;
  }

  equals(other: OrganizationUserStatus) {
    return this._value === other._value;
  }
}
