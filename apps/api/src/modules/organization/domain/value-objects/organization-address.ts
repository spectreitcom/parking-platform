import { IsNotEmpty, IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class OrganizationAddress {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length) {
      throw new AppError('VALIDATION_ERROR', 'Invalid organization address');
    }
  }

  static fromString(value: string) {
    return new OrganizationAddress(value);
  }

  public get value(): string {
    return this._value;
  }

  equals(address: OrganizationAddress) {
    return this._value === address.value;
  }
}
