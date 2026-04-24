import { CreateReservationCommandHandler } from './create-reservation.command-handler';
import { CancelReservationCommandHandler } from './cancel-reservation.command-handler';
import { UpdateReservationCommandHandler } from './update-reservation.command-handler';

export const commandHandlers = [
  CreateReservationCommandHandler,
  CancelReservationCommandHandler,
  UpdateReservationCommandHandler,
];
