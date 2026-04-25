import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelReservationDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  readonly version: number;

  constructor(version: number) {
    this.version = version;
  }
}
