import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeletePlaceTypeQueryParamsDto {
  @ApiProperty({
    description: 'The version of the place type',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
