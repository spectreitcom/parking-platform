import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { RequestUser } from '../../../auth/types';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { CompleteReservationDto } from '../dto/complete-reservation.dto';
import { AppError } from 'src/shared/errors';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';

@Injectable()
export class CompleteReservationHandler implements IControllerHandler {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly parkingFacade: ParkingFacade,
  ) {}

  async handle(
    reservationId: string,
    dto: CompleteReservationDto,
    managerUser: RequestUser,
  ) {
    const reservation =
      await this.reservationFacade.getReservationById(reservationId);

    if (!reservation) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Reservation with id ${reservationId} not found`,
      );
    }

    const parking = await this.parkingFacade.getParkingById(
      reservation.parkingId,
    );

    if (!parking) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Parking with id ${reservation.parkingId} not found`,
      );
    }

    const organizationIds = managerUser.organizations.map(
      (org) => org.organizationId,
    );

    if (!organizationIds.includes(parking.organizationId)) {
      throw new ForbiddenException('Access is forbidden');
    }

    await this.reservationFacade.completeReservation(
      reservationId,
      dto.version,
    );

    return { id: reservation.reservationId };
  }
}
