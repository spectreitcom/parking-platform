import { GetPaymentByIdQueryHandler } from './get-payment-by-id.query-handler';
import { GetPaymentByReservationIdQueryHandler } from './get-payment-by-reservation-id.query-handler';
import { GetPaymentsByReservationIdsQueryHandler } from './get-payments-by-reservation-ids.query-handler';

export const queryHandlers = [
  GetPaymentByReservationIdQueryHandler,
  GetPaymentByIdQueryHandler,
  GetPaymentsByReservationIdsQueryHandler,
];
