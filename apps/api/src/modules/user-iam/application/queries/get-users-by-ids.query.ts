import { IQuery } from '@nestjs/cqrs';
import { IsArray, IsString, IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetUsersByIdsQuery implements IQuery {
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  readonly userIds: string[];

  constructor(userIds: string[]) {
    this.userIds = userIds;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid GetUsersByIdsQuery');
    }
  }
}
