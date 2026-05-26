import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from 'src/shared/constants';

export class GetParkingSpotsQueryParamsDto {
  @ApiProperty({
    description: 'UUID of the parking for which to retrieve spots',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  readonly parkingId: string;

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

  constructor(parkingId: string, page?: number, limit?: number) {
    this.parkingId = parkingId;
    this.page = page;
    this.limit = limit;
  }
}
