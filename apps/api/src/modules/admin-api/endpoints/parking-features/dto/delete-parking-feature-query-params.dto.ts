import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
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
  @IsNumber()
  @IsPositive()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
