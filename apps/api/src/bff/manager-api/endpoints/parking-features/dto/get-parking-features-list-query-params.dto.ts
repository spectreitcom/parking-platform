import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
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
    description: 'The search query',
    example: 'premium',
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  readonly search?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['PARKING', 'PARKING_SPOT'], { each: true })
  readonly levels?: string[];

  constructor(
    page?: number,
    limit?: number,
    search?: string,
    levels?: string[],
  ) {
    this.page = page;
    this.limit = limit;
    this.search = search;
    this.levels = levels;
  }
}
