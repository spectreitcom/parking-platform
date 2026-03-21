import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteParkingFeatureQueryParamsDto {
  @ApiProperty({
    description: 'The version of the parking feature',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
