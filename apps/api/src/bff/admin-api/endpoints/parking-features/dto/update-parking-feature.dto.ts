import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  PARKING_LEVEL,
  PARKING_SPOT_LEVEL,
} from '../../../../../modules/parking/domain/constants';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateParkingFeatureDto {
  @ApiProperty({
    description: 'The name of the parking feature',
    example: 'Has a charger',
    required: true,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    description: 'The levels of the parking feature',
    example: [PARKING_LEVEL, PARKING_SPOT_LEVEL],
    required: true,
    isArray: true,
    anyOf: [
      {
        type: 'string',
        enum: [PARKING_LEVEL, PARKING_SPOT_LEVEL],
      },
    ],
  })
  @IsArray()
  @IsIn([PARKING_LEVEL, PARKING_SPOT_LEVEL], {
    each: true,
  })
  readonly levels: string[];

  @ApiProperty({
    description: 'The version of the parking feature',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(name: string, levels: string[], version: number) {
    this.name = name;
    this.levels = levels;
    this.version = version;
  }
}
