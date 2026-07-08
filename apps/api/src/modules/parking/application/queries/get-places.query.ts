import { IQuery } from '@nestjs/cqrs';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsUUID,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetPlacesQuery implements IQuery {
  @IsInt()
  @Min(1)
  public readonly page: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  public readonly limit: number;

  @IsOptional()
  @IsString()
  public readonly search?: string;

  @IsOptional()
  @IsUUID()
  public readonly placeTypeId?: string;

  constructor(
    page: number,
    limit: number,
    placeTypeId?: string,
    search?: string,
  ) {
    this.page = page;
    this.limit = limit;
    this.placeTypeId = placeTypeId;
    this.search = search;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid GetPlacesQuery`);
    }
  }
}
