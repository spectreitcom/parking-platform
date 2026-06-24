import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateOrDeactivateParkingSpotDto {
  @ApiProperty({
    description:
      'Version of the parking spot for optimistic concurrency control',
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
