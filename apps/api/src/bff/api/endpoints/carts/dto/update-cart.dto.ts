import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
  @ApiProperty({ description: 'Timestamp in milliseconds' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly arrival: number;

  @ApiProperty({ description: 'Timestamp in milliseconds' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly departure: number;

  @ApiProperty({ format: 'uuid', isArray: true })
  @IsArray()
  @IsUUID('4', { each: true })
  readonly addonIds: string[];

  constructor(arrival: number, departure: number, addonIds: string[]) {
    this.arrival = arrival;
    this.departure = departure;
    this.addonIds = addonIds;
  }
}
