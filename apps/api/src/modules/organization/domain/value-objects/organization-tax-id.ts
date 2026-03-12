import { IsNotEmpty, IsString, MaxLength, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class OrganizationTaxId {
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
      throw new AppError('VALIDATION_ERROR', 'Invalid tax ID format.');
    }
  }

  static fromString(value: string) {
    return new OrganizationTaxId(value);
  }

  public get value(): string {
    return this._value;
  }

  equals(taxId: OrganizationTaxId) {
    return this._value === taxId.value;
  }
}
