import { IQuery } from '@nestjs/cqrs';
import { IsInt, Max, Min, validateSync } from 'class-validator';
import { AppError } from '../../../../shared/errors';
import { MAX_PAGE_SIZE } from '../../../../shared/constants';

export class GetOrganizationUsersListQuery implements IQuery {
  @IsInt()
  @Min(1)
  public readonly page: number;

  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  public readonly limit: number;

  public readonly search?: string;

  constructor(page: number, limit: number, search?: string) {
    this.page = page;
    this.limit = limit;
    this.search = search;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Invalid GetOrganizationUsersListQuery`,
      );
    }
  }
}
