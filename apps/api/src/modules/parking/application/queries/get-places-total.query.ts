import { IQuery } from '@nestjs/cqrs';
import {
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetPlacesTotalQuery implements IQuery {
  @IsOptional()
  @IsString()
  public readonly search?: string;

  @IsUUID()
  public readonly placeTypeId: string;

  constructor(placeTypeId: string, search?: string) {
    this.placeTypeId = placeTypeId;
    this.search = search;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', `Invalid GetPlacesTotalQuery`);
    }
  }
}
