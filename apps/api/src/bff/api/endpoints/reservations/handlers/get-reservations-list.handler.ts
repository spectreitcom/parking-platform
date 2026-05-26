import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetReservationsListQueryParamsDto } from '../dto/get-reservations-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

@Injectable()
export class GetReservationsListHandler implements IControllerHandler {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly parkingFacade: ParkingFacade,
  ) {}

  async handle(userId: string, queryParams: GetReservationsListQueryParamsDto) {
    const reservations = await this.reservationFacade.getUserReservationsList(
      userId,
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );

    const parkings = await this.parkingFacade.getParkingByIds(
      reservations.map((r) => r.parkingId),
    );

    const parkingMap = new Map(parkings.map((p) => [p.id, p]));

    const data: ((typeof reservations)[0] & {
      parking: { id: string; name: string } | null;
    })[] = [];

    for (const reservation of reservations) {
      const parking = parkingMap.get(reservation.parkingId);
      data.push({
        ...reservation,
        parking: parking ? { id: parking.id, name: parking.name } : null,
      });
    }

    const total = await this.reservationFacade.getUserReservationsListTotal(
      userId,
      queryParams.search,
    );

    return { data, total, currentPage: queryParams.page ?? 1 };
  }
}
