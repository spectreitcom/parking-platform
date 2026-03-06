import { IsIn, validateSync } from 'class-validator';
import {
  ADMIN_ACTIVE,
  ADMIN_CREATED,
  ADMIN_INVITED,
  ADMIN_SUSPENDED,
} from '../constants';
import { AppError } from '../../../../shared/errors';

export class AdminStatus {
  @IsIn([ADMIN_CREATED, ADMIN_INVITED, ADMIN_SUSPENDED, ADMIN_ACTIVE])
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid AdminStatus');
    }
  }

  static created() {
    return new AdminStatus(ADMIN_CREATED);
  }

  static invited() {
    return new AdminStatus(ADMIN_INVITED);
  }

  static suspended() {
    return new AdminStatus(ADMIN_SUSPENDED);
  }

  static active() {
    return new AdminStatus(ADMIN_ACTIVE);
  }

  static fromString(value: string) {
    return new AdminStatus(value);
  }

  get value() {
    return this._value;
  }

  equals(other: AdminStatus) {
    return this._value === other._value;
  }
}
