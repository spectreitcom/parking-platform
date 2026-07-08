import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GetPlacesQueryParamsDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  readonly placeTypeId?: string;

  constructor(
    placeTypeId?: string,
    page?: number,
    limit?: number,
    search?: string,
  ) {
    this.placeTypeId = placeTypeId;
    this.page = page;
    this.search = search;
    this.limit = limit;
  }
}
