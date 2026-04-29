import { ReservationStatus } from '../value-objects/reservation-status';

export class UpdatingService {
  static canUpdate(status: ReservationStatus) {
    if (
      status.equals(ReservationStatus.cancelled()) ||
      status.equals(ReservationStatus.completed())
    ) {
      return false;
    }

    return true;
  }
}
