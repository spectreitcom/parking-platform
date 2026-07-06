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

  @IsUUID()
  public readonly placeTypeId: string;

  constructor(
    placeTypeId: string,
    page: number,
    limit: number,
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
