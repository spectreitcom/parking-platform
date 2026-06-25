import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { UpdateReservationDto } from '../dto/update-reservation.dto';

@Injectable()
export class UpdateReservationHandler implements IControllerHandler {
  constructor(private readonly reservationFacade: ReservationFacade) {}

  async handle(
    reservationId: string,
    userId: string,
    dto: UpdateReservationDto,
  ): Promise<{ id: string }> {
    const id = await this.reservationFacade.updateReservation(
      reservationId,
      userId,
      dto.version,
      dto.registrationNumber,
    );

    return { id };
  }
}
