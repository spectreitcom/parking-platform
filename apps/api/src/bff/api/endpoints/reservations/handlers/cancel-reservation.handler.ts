import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { CancelReservationDto } from '../dto/cancel-reservation.dto';

@Injectable()
export class CancelReservationHandler implements IControllerHandler {
  constructor(private readonly reservationFacade: ReservationFacade) {}

  async handle(
    reservationId: string,
    userId: string,
    dto: CancelReservationDto,
  ): Promise<{ id: string }> {
    const id = await this.reservationFacade.cancelReservation(
      reservationId,
      userId,
      dto.version,
    );

    return { id };
  }
}
