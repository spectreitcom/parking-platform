import { IQuery } from '@nestjs/cqrs';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { PARKING_LEVEL, PARKING_SPOT_LEVEL } from '../../domain/constants';
import { AppError } from 'src/shared/errors';
import { MAX_PAGE_SIZE } from 'src/shared/constants';

export class GetParkingFeaturesListQuery implements IQuery {
  @IsString()
  @IsOptional()
  readonly search?: string;

  @IsOptional()
  @IsArray()
  @IsIn([PARKING_LEVEL, PARKING_SPOT_LEVEL], { each: true })
  readonly levels?: string[];

  @IsNumber()
  @IsInt()
  @Min(1)
  readonly page: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly limit: number;

  constructor(page: number, limit: number, search?: string, levels?: string[]) {
    this.page = page;
    this.limit = limit;
    this.search = search;
    this.levels = levels;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetParkingFeaturesListQuery',
      );
    }
  }
}
