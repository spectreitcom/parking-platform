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

  constructor(parkingSpotId: string, arrival: number, departure: number) {
    this.parkingSpotId = parkingSpotId;
    this.arrival = arrival;
    this.departure = departure;
  }
}
