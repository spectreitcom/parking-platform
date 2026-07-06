import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAssetImageQueryDto {
  @ApiPropertyOptional({
    description: 'Width of the image in pixels',
    example: 800,
    minimum: 1,
    maximum: 1920,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(1920)
  readonly width?: number;

  @ApiPropertyOptional({
    description: 'Height of the image in pixels',
    example: 600,
    minimum: 1,
    maximum: 1080,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(1080)
  readonly height?: number;
}
