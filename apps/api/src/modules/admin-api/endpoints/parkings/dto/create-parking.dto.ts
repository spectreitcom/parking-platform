import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParkingDto {
  @ApiProperty({
    description: 'The name of the parking',
    example: 'Parking 1',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    description: 'The address of the parking',
    example: '123 Main St',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly address: string;

  @ApiProperty({
    description: 'The longitude of the parking location',
    example: 18.646638,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly longitude: number;

  @ApiProperty({
    description: 'The latitude of the parking location',
    example: 54.352025,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly latitude: number;

  @ApiProperty({
    description: 'The organization ID the parking belongs to',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  readonly organizationId: string;

  @ApiProperty({
    description: 'The place ID where the parking is located',
    example: 'e390f1ee-6c54-4b01-90e6-d701748f0851',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  readonly placeId: string;

  constructor(
    name: string,
    address: string,
    longitude: number,
    latitude: number,
    organizationId: string,
    placeId: string,
  ) {
    this.name = name;
    this.address = address;
    this.longitude = longitude;
    this.latitude = latitude;
    this.organizationId = organizationId;
    this.placeId = placeId;
  }
}
