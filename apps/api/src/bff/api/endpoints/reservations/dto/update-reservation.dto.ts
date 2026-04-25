import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly version: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly registrationNumber: string;

  constructor(version: number, registrationNumber: string) {
    this.version = version;
    this.registrationNumber = registrationNumber;
  }
}
