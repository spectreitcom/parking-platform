import { IsArray, IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetPlaceByIdsQuery {
  @IsArray()
  @IsUUID('4', { each: true })
  readonly ids: string[];

  constructor(ids: string[]) {
    this.ids = [...ids];
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid GetPlaceByIdsQuery');
    }
  }
}
