import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsPositive,
  IsInt,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateParkingDto {
  @ApiProperty({
    description: 'The name of the parking',
    example: 'Updated Parking Name',
    required: true,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    description: 'The address of the parking',
    example: '456 Updated St',
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
    minimum: -180,
    maximum: 180,
  })
  @IsLongitude()
  @IsNotEmpty()
  readonly longitude: number;

  @ApiProperty({
    description: 'The latitude of the parking location',
    example: 54.352025,
    required: true,
    minimum: -90,
    maximum: 90,
  })
  @IsLatitude()
  @IsNotEmpty()
  readonly latitude: number;

  @ApiProperty({
    description: 'The asset IDs associated with the parking',
    example: ['d290f1ee-6c54-4b01-90e6-d701748f0851'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly assetIds: string[] = [];

  @ApiProperty({
    description: 'The parking feature IDs associated with the parking',
    example: ['e390f1ee-6c54-4b01-90e6-d701748f0851'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly parkingFeatureIds: string[] = [];

  @ApiProperty({
    description: 'The parking addon IDs associated with the parking',
    example: ['f490f1ee-6c54-4b01-90e6-d701748f0851'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly parkingAddonIds: string[] = [];

  @ApiProperty({
    description: 'The description of the parking',
    example: 'Updated description',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly description: string = '';

  @ApiProperty({
    description: 'The statute of the parking',
    example: 'Updated statute text',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly statute?: string;

  @ApiProperty({
    description: 'The version of the parking',
    example: 1,
    required: true,
  })
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(
    name: string,
    address: string,
    longitude: number,
    latitude: number,
    version: number,
    assetIds: string[] = [],
    parkingFeatureIds: string[] = [],
    parkingAddonIds: string[] = [],
    description: string = '',
    statute: string = '',
  ) {
    this.name = name;
    this.address = address;
    this.longitude = longitude;
    this.latitude = latitude;
    this.version = version;
    this.assetIds = assetIds;
    this.parkingFeatureIds = parkingFeatureIds;
    this.parkingAddonIds = parkingAddonIds;
    this.description = description;
    this.statute = statute;
  }
}
