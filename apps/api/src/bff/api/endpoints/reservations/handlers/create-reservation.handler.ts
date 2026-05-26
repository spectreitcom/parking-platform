import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { AppError } from 'src/shared/errors';

@Injectable()
export class CreateReservationHandler implements IControllerHandler {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly parkingFacade: ParkingFacade,
  ) {}

  async handle(userId: string, dto: CreateReservationDto): Promise<string> {
    const parking = await this.parkingFacade.getParkingByParkingSpotId(
      dto.parkingSpotId,
    );

    if (!parking) {
      throw new AppError('VALIDATION_ERROR', 'Parking not found');
    }

    return await this.reservationFacade.createReservation(
      dto.cartId,
      userId,
      parking.id,
      dto.parkingSpotId,
      dto.startDate,
      dto.endDate,
      dto.registrationNumber,
      dto.lines,
      dto.addons,
    );
  }
}
