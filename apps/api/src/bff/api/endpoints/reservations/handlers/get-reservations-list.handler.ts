import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetReservationsListQueryParamsDto } from '../dto/get-reservations-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { PaymentFacade } from 'src/modules/payment/application/payment.facade';

@Injectable()
export class GetReservationsListHandler implements IControllerHandler {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly parkingFacade: ParkingFacade,
    private readonly paymentFacade: PaymentFacade,
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

    const payments = await this.paymentFacade.getPaymentsByReservationIds(
      reservations.map((r) => r.id),
    );

    const paymentsMap = new Map(payments.map((p) => [p.reservationId, p]));

    const data: ((typeof reservations)[0] & {
      parking: { id: string; name: string } | null;
      payment: (typeof payments)[number] | null;
    })[] = [];

    for (const reservation of reservations) {
      const parking = parkingMap.get(reservation.parkingId);
      const { arrivalDate, departureDate, ...rest } = reservation;
      data.push({
        ...rest,
        arrivalDate,
        departureDate,
        parking: parking ? { id: parking.id, name: parking.name } : null,
        payment: paymentsMap.get(reservation.id) ?? null,
      });
    }

    const total = await this.reservationFacade.getUserReservationsListTotal(
      userId,
      queryParams.search,
    );

    return { data, total, currentPage: queryParams.page ?? 1 };
  }
}
