import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteReservationDto {
  @ApiProperty({
    description: 'Version of the reservation for optimistic concurrency control',
    type: 'number',
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
