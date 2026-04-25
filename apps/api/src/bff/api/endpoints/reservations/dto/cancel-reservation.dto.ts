import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelReservationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
