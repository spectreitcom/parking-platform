import { ReservationStatus } from '../value-objects/reservation-status';

export class UpdatingService {
  static canUpdate(status: ReservationStatus) {
    return !(
      status.equals(ReservationStatus.cancelled()) ||
      status.equals(ReservationStatus.completed())
    );
  }
}
