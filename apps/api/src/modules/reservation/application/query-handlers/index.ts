import { GetReservationsListQueryHandler } from './get-reservations-list.query-handler';
import { GetReservationsListTotalQueryHandler } from './get-reservations-list-total.query-handler';
import { GetUserReservationsListQueryHandler } from './get-user-reservations-list.query-handler';
import { GetUserReservationsListTotalQueryHandler } from './get-user-reservations-list-total.query-handler';

export const queryHandlers = [
  GetReservationsListQueryHandler,
  GetReservationsListTotalQueryHandler,
  GetUserReservationsListQueryHandler,
  GetUserReservationsListTotalQueryHandler,
];
