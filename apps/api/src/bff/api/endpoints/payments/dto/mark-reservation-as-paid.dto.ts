import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MarkReservationAsPaidDto {
  @ApiProperty({
    description: 'The reservation id',
    format: 'uuid',
  })
  @IsUUID()
  readonly reservationId: string;

  constructor(reservationId: string) {
    this.reservationId = reservationId;
  }
}
