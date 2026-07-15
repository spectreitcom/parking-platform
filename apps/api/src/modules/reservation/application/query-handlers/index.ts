import { GetReservationsListQueryHandler } from './get-reservations-list.query-handler';
import { GetReservationsListTotalQueryHandler } from './get-reservations-list-total.query-handler';
import { GetUserReservationsListQueryHandler } from './get-user-reservations-list.query-handler';
import { GetUserReservationsListTotalQueryHandler } from './get-user-reservations-list-total.query-handler';
import { GetReservationDetailsQueryHandler } from './get-reservation-details.query-handler';
import { GetReservationByIdQueryHandler } from './get-reservation-by-id.query-handler';
import { GetReservationsByParkingIdQueryHandler } from './get-reservations-by-parking-id.query-handler';
import { GetReservationsByParkingIdTotalQueryHandler } from './get-reservations-by-parking-id-total.query-handler';

export const queryHandlers = [
  GetReservationsListQueryHandler,
  GetReservationsListTotalQueryHandler,
  GetUserReservationsListQueryHandler,
  GetUserReservationsListTotalQueryHandler,
  GetReservationDetailsQueryHandler,
  GetReservationByIdQueryHandler,
  GetReservationsByParkingIdQueryHandler,
  GetReservationsByParkingIdTotalQueryHandler,
];
