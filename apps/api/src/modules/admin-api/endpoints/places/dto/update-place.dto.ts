import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlaceDto {
  @ApiProperty({
    description: 'The name of the place',
    example: 'Main Square Updated',
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
  @IsLatitude()
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
  @IsLongitude()
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
    description: 'The address of the place',
    example: '123 Main St, Gdańsk',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly address: string;

  @ApiProperty({
    description: 'The version of the place',
    example: 1,
    required: true,
  })
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(
    name: string,
    latitude: number,
    longitude: number,
    placeTypeId: string,
    address: string,
    version: number,
  ) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.placeTypeId = placeTypeId;
    this.address = address;
    this.version = version;
  }
}
