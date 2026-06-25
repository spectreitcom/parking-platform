import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly cartId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly registrationNumber: string;

  constructor(cartId: string, registrationNumber: string) {
    this.cartId = cartId;
    this.registrationNumber = registrationNumber;
  }
}
