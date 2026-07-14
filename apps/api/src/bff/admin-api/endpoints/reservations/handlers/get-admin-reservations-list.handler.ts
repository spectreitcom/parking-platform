import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { GetReservationsListQueryParamsDto } from '../dto/get-reservations-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { PaymentFacade } from 'src/modules/payment/application/payment.facade';

@Injectable()
export class GetAdminReservationsListHandler implements IControllerHandler {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly userIamFacade: UserIamFacade,
    private readonly paymentFacade: PaymentFacade,
  ) {}

  async handle(queryParams: GetReservationsListQueryParamsDto) {
    const reservations = await this.reservationFacade.getReservationsList(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );

    const payments = await this.paymentFacade.getPaymentsByReservationIds(
      reservations.map((reservation) => reservation.id),
    );

    const paymentsMap = new Map(
      payments.map((payment) => [payment.reservationId, payment]),
    );

    const users = await this.userIamFacade.getUsersByIds(
      reservations.map((reservation) => reservation.userId),
    );

    const usersMap = new Map(users.map((user) => [user.id, user]));

    const data: (Omit<(typeof reservations)[0], 'userId'> & {
      user: {
        id: string;
        email: string;
        name: string;
        provider: string;
      };
      payment: (typeof payments)[number] | null;
    })[] = [];

    for (const reservation of reservations) {
      const user = usersMap.get(reservation.userId);

      data.push({
        ...reservation,
        // user must be always.
        user: user!,
        payment: paymentsMap.get(reservation.id) ?? null,
      });
    }

    const total = await this.reservationFacade.getReservationsListTotal(
      queryParams.search,
    );

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }
}
