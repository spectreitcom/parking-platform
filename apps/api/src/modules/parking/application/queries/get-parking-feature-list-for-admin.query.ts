import { IQuery } from '@nestjs/cqrs';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';
import { AppError } from '../../../../shared/errors';

export class GetParkingFeatureListForAdminQuery implements IQuery {
  @IsNumber()
  @IsInt()
  @Min(1)
  readonly page: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  readonly limit: number;

  @IsOptional()
  @IsString()
  readonly search?: string;

  constructor(page: number, limit: number, search?: string) {
    this.page = page;
    this.limit = limit;
    this.search = search;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetParkingFeatureListForAdminQuery',
      );
    }
  }
}
