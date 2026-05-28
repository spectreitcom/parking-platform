import { IQuery } from '@nestjs/cqrs';
import { IsOptional, IsString, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetParkingFeatureListForAdminTotalQuery implements IQuery {
  @IsOptional()
  @IsString()
  readonly search?: string;

  constructor(search?: string) {
    this.search = search;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetParkingFeatureListForAdminTotalQuery',
      );
    }
  }
}
