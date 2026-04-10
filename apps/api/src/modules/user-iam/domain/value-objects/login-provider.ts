import { IsIn, validateSync } from 'class-validator';
import { CREDENTIALS_PROVIDER } from 'src/modules/user-iam/domain/constants';
import { AppError } from 'src/shared/errors';

export class LoginProvider {
  @IsIn([CREDENTIALS_PROVIDER])
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid login provider');
    }
  }

  static fromString(value: string) {
    return new LoginProvider(value);
  }

  static credentials() {
    return new LoginProvider(CREDENTIALS_PROVIDER);
  }

  get value(): string {
    return this._value;
  }

  equals(other: LoginProvider) {
    return this.value === other.value;
  }
}
