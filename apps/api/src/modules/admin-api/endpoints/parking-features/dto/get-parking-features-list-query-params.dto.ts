import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_PAGE_SIZE } from '../../../constants';

export class GetParkingFeaturesListQueryParamsDto {
  @ApiProperty({
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  readonly page?: number;

  @ApiProperty({
    description: 'The number of items per page',
    example: DEFAULT_PAGE_SIZE,
    required: false,
  })
  @IsOptional()
  @IsInt()
  readonly limit?: number;

  @ApiProperty({
    description: 'The search query',
    example: 'premium',
    required: false,
  })
  @IsOptional()
  readonly search?: string;

  constructor(page?: number, limit?: number, search?: string) {
    this.page = page;
    this.limit = limit;
    this.search = search;
  }
}
