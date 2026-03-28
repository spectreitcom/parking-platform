import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeleteParkingAddonQueryParamsDto {
  @ApiProperty({
    description: 'The version of the parking addon',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
