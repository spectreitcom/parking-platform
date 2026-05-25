import { IQuery } from '@nestjs/cqrs';
import { IsUUID, validateSync } from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetParkingsByOrganizationAndOrganizationUserForManagerTotalQuery implements IQuery {
  @IsUUID()
  readonly organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
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
