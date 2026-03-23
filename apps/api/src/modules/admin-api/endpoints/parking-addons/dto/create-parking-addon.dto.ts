import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParkingAddonDto {
  @ApiProperty({
    description: 'The code of the parking addon',
    example: 'PA1',
    required: true,
    maxLength: 60,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  readonly code: string;

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

  constructor(code: string, name: string, price: number) {
    this.code = code;
    this.name = name;
    this.price = price;
  }
}
