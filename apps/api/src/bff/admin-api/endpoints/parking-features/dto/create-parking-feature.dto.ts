import { IsArray, IsIn, IsString, MaxLength } from 'class-validator';
import {
  PARKING_LEVEL,
  PARKING_SPOT_LEVEL,
} from 'src/modules/parking/domain/constants';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParkingFeatureDto {
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

  constructor(name: string, levels: string[]) {
    this.name = name;
    this.levels = levels;
  }
}
