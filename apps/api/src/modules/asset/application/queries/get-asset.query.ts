import { IQuery } from '@nestjs/cqrs';
import { IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetAssetQuery implements IQuery {
  @IsUUID()
  readonly id: string;

  constructor(id: string) {
    this.id = id;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid GetAssetQuery');
    }
  }
}
