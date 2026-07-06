import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDetailsQueryParamsDto {
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

  constructor(departure: number, arrival: number) {
    this.departure = departure;
    this.arrival = arrival;
  }
}
