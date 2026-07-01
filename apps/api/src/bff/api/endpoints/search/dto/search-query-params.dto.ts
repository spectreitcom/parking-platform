import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryParamsDto {
  @ApiProperty({ description: 'Place ID' })
  @IsUUID()
  @IsNotEmpty()
  readonly placeId: string;

  @ApiProperty({ description: 'Timestamp in milliseconds' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  readonly departure: number;

  @ApiProperty({ description: 'Timestamp in milliseconds' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  readonly arrival: number;

  @ApiProperty({ format: 'uuid', isArray: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly featureIds?: string[];

  constructor(
    placeId: string,
    departure: number,
    arrival: number,
    featureIds?: string[],
  ) {
    this.placeId = placeId;
    this.departure = departure;
    this.arrival = arrival;
    this.featureIds = featureIds;
  }
}
