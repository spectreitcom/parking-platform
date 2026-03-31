import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceDto {
  @ApiProperty({
    description: 'The name of the place',
    example: 'Main Square',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    description: 'The latitude of the place',
    example: 54.352025,
    required: true,
    minimum: -90,
    maximum: 90,
  })
  @Min(-90)
  @Max(90)
  @IsNumber()
  @IsNotEmpty()
  readonly latitude: number;

  @ApiProperty({
    description: 'The longitude of the place',
    example: 18.646638,
    required: true,
    minimum: -180,
    maximum: 180,
  })
  @Min(-180)
  @Max(180)
  @IsNumber()
  @IsNotEmpty()
  readonly longitude: number;

  @ApiProperty({
    description: 'The ID of the place type',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  readonly placeTypeId: string;

  @ApiProperty({
    description: 'Whether the place is active',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  readonly active: boolean;

  @ApiProperty({
    description: 'The address of the place',
    example: '123 Main St, Gdańsk',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly address: string;

  constructor(
    name: string,
    latitude: number,
    longitude: number,
    placeTypeId: string,
    active: boolean,
    address: string,
  ) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.placeTypeId = placeTypeId;
    this.active = active;
    this.address = address;
  }
}
