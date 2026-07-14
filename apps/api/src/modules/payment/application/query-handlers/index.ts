import { GetPaymentByIdQueryHandler } from './get-payment-by-id.query-handler';
import { GetPaymentByReservationIdQueryHandler } from './get-payment-by-reservation-id.query-handler';

export const queryHandlers = [
  GetPaymentByReservationIdQueryHandler,
  GetPaymentByIdQueryHandler,
];
