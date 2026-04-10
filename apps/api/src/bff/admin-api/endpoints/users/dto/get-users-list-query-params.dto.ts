import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';

export class GetUsersListQueryParamsDto {
  @ApiProperty({
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsPositive()
  readonly page?: number;

  @ApiProperty({
    description: 'The number of items per page',
    example: DEFAULT_PAGE_SIZE,
    required: false,
  })
  @IsInt()
  @IsPositive()
  readonly limit?: number;

  @ApiProperty({
    description: 'The search query',
    example: 'user',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly search?: string;
}
