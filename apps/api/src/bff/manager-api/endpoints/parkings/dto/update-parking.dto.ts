import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateParkingDto {
  @ApiProperty({
    description: 'Parking name',
    maxLength: 255,
  })
  @MaxLength(255)
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Parking asset ids',
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  readonly assetIds: string[];

  @ApiProperty({
    description: 'Parking feature ids',
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  readonly parkingFeatureIds: string[];

  @ApiProperty({
    description: 'Parking addon ids',
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  readonly parkingAddonIds: string[];

  @ApiProperty({
    description: 'Parking description',
  })
  @IsString()
  @IsOptional()
  readonly description: string;

  @ApiProperty({
    description: 'Parking statute',
  })
  @IsString()
  @IsOptional()
  readonly statute: string;

  @ApiProperty({
    description: 'Version for concurrency control',
  })
  @IsPositive()
  @IsInt()
  @IsNumber()
  readonly version: number;

  constructor(
    name: string,
    assetIds: string[],
    parkingFeatureIds: string[],
    parkingAddonIds: string[],
    description: string,
    statute: string,
    version: number,
  ) {
    this.name = name;
    this.assetIds = assetIds;
    this.parkingFeatureIds = parkingFeatureIds;
    this.parkingAddonIds = parkingAddonIds;
    this.description = description;
    this.statute = statute;
    this.version = version;
  }
}
