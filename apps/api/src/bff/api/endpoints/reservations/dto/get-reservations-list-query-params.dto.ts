import {
  IsInt,
  Max,
  IsOptional,
  MaxLength,
  Min,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from 'src/shared/constants';

export class GetReservationsListQueryParamsDto {
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
    example: 'KOL123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly search?: string;

  constructor(page?: number, limit?: number, search?: string) {
    this.page = page;
    this.limit = limit;
    this.search = search;
  }
}
