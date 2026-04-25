import { ReservationCreatedEventHandler } from './reservation-created.event-handler';
import { ReservationCancelledEventHandler } from './reservation-cancelled.event-handler';
import { ReservationUpdatedEventHandler } from './reservation-updated.event-handler';
import { ReservationCompletedEventHandler } from './reservation-completed.event-handler';

export const eventHandlers = [
  ReservationCreatedEventHandler,
  ReservationCancelledEventHandler,
  ReservationUpdatedEventHandler,
  ReservationCompletedEventHandler,
];
