import { IQuery } from '@nestjs/cqrs';
import {
  IsInt,
  Max,
  IsOptional,
  IsPositive,
  Min,
  validateSync,
} from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { MAX_PAGE_SIZE } from '../../../../shared/constants';

export class GetPlaceTypeListQuery implements IQuery {
  @IsInt()
  @IsPositive()
  @Min(1)
  readonly page: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly limit: number;

  @IsOptional()
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
      throw new AppError('VALIDATION_ERROR', 'Invalid GetPlaceTypeListQuery');
    }
  }
}
