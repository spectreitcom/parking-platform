import { IQuery } from '@nestjs/cqrs';
import {
  IsInt,
  IsNumber,
  IsUUID,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { MAX_PAGE_SIZE } from 'src/shared/constants';
import { AppError } from 'src/shared/errors';

export class GetParkingsByOrganizationAndOrganizationUserForManagerQuery implements IQuery {
  @IsUUID()
  readonly organizationId: string;

  @IsNumber()
  @IsInt()
  @Min(1)
  readonly page: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly limit: number;

  constructor(organizationId: string, page: number, limit: number) {
    this.organizationId = organizationId;
    this.page = page;
    this.limit = limit;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetParkingsByOrganizationAndOrganizationUserForManagerQuery',
      );
    }
  }
}
