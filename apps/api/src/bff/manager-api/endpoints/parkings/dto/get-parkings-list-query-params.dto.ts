import {
  IsInt,
  Max,
  IsOptional,
  Min,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from 'src/shared/constants';

export class GetParkingFeaturesListQueryParamsDto {
  @ApiProperty({
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number;

  @ApiProperty({
    description: 'The number of items per page',
    example: DEFAULT_PAGE_SIZE,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly limit?: number;

  @ApiProperty({
    description: 'The organization ID',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly organizationId: string;

  constructor(organizationId: string, page?: number, limit?: number) {
    this.page = page;
    this.limit = limit;
    this.organizationId = organizationId;
  }
}
