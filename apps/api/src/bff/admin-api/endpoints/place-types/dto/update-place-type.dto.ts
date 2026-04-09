import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlaceTypeDto {
  @ApiProperty({
    description: 'The name of the place type',
    example: 'Train station',
    required: true,
    maxLength: 60,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  readonly name: string;

  @ApiProperty({
    description: 'The version of the place type',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(name: string, version: number) {
    this.name = name;
    this.version = version;
  }
}
