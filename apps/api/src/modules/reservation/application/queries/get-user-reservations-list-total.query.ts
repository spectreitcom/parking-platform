import { IQuery } from '@nestjs/cqrs';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetUserReservationsListTotalQuery implements IQuery {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsOptional()
  @IsString()
  readonly search?: string;

  constructor(userId: string, search?: string) {
    this.userId = userId;
    this.search = search;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid GetUserReservationsListTotalQuery',
      );
    }
  }
}
