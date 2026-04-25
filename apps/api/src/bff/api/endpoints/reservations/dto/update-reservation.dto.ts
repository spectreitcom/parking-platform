import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservationDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
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
