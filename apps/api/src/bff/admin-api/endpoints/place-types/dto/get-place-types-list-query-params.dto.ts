import { IsInt, Max, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants';

export class GetPlaceTypesListQueryParamsDto {
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
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    type: 'integer',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  readonly limit?: number;

  @ApiProperty({
    description: 'The search query',
    example: 'outdoor',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly search?: string;

  constructor(page?: number, limit?: number, search?: string) {
    this.page = page;
    this.limit = limit;
    this.search = search;
  }
}
