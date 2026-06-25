import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  readonly parkingSpotId: string;

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

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly pricePerDay: number;

  constructor(
    parkingSpotId: string,
    arrival: number,
    departure: number,
    pricePerDay: number,
  ) {
    this.parkingSpotId = parkingSpotId;
    this.arrival = arrival;
    this.departure = departure;
    this.pricePerDay = pricePerDay;
  }
}
