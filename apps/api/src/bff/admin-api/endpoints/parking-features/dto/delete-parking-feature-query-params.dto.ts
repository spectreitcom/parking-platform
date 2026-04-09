import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeleteParkingFeatureQueryParamsDto {
  @ApiProperty({
    description: 'The version of the parking feature',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
