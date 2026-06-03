import { IQuery } from '@nestjs/cqrs';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
  validateSync,
} from 'class-validator';
import { AppError } from 'src/shared/errors';

export class GetAssetImageQuery implements IQuery {
  @IsUUID()
  readonly id: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(1920)
  readonly width?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(1080)
  readonly height?: number;

  constructor(id: string, width?: number, height?: number) {
    this.id = id;
    this.width = width;
    this.height = height;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid GetAssetQuery');
    }
  }
}
