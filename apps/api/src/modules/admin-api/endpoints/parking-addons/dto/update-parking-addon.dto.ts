import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateParkingAddonDto {
  @ApiProperty({
    description: 'The name of the parking addon',
    example: 'Premium',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    description: 'The price of the parking addon in grosze',
    example: 1000,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  readonly price: number;

  @ApiProperty({
    description: 'The version of the parking addon',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(name: string, price: number, version: number) {
    this.name = name;
    this.price = price;
    this.version = version;
  }
}
