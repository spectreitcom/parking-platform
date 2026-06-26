import { IQuery } from '@nestjs/cqrs';
import { IsArray, IsNotEmpty, IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class SearchQuery implements IQuery {
  @IsUUID()
  @IsNotEmpty()
  readonly placeId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  readonly featureIds: string[];

  constructor(placeId: string, featureIds: string[] = []) {
    this.placeId = placeId;
    this.featureIds = featureIds;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);

    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'SearchQuery validation failed');
    }
  }
}
