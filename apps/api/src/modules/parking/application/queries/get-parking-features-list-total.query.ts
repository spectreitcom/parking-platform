import { IQuery } from '@nestjs/cqrs';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { PARKING_LEVEL, PARKING_SPOT_LEVEL } from '../../domain/constants';
import { AppError } from 'src/shared/errors';

export class GetParkingFeaturesListTotalQuery implements IQuery {
  @IsString()
  @IsOptional()
  readonly search?: string;

  @IsOptional()
  @IsArray()
  @IsIn([PARKING_LEVEL, PARKING_SPOT_LEVEL], { each: true })
  readonly levels?: string[];

  constructor(search?: string, levels?: string[]) {
    this.search = search;
    this.levels = levels;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetParkingFeaturesListTotalQuery',
      );
    }
  }
}
