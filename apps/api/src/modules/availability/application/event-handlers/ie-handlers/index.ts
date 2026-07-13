import { ReservationCreatedIeHandler } from './reservation-created.ie-handler';
import { ReservationCancelledIeHandler } from './reservation-cancelled.ie-handler';
import { ReservationCompletedIeHandler } from './reservation-completed.ie-handler';

export const ieHandlers = [
  ReservationCreatedIeHandler,
  ReservationCancelledIeHandler,
  ReservationCompletedIeHandler,
];
