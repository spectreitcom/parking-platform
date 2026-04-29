import { ReservationDateRange } from '../value-objects/reservation-date-range';
import { ReservationStatus } from '../value-objects/reservation-status';
import { ReservationAddon } from '../value-objects/reservation-addon';

export class CancellationService {
  static canCancel(
    dateRange: ReservationDateRange,
    status: ReservationStatus,
    addons: ReservationAddon[],
  ) {
    if (
      status.equals(ReservationStatus.cancelled()) ||
      status.equals(ReservationStatus.completed())
    ) {
      return false;
    }

    const canCancel15MinutesBefore = addons.some((addon) =>
      addon.equals(ReservationAddon.canCancel15MinutesBefore()),
    );

    if (canCancel15MinutesBefore) {
      const now = Date.now();
      const arrival = dateRange.arrival;
      const diff = arrival - now;
      if (diff < 15 * 60 * 1000) {
        return false;
      }
    } else {
      const now = Date.now();
      const arrival = dateRange.arrival;
      const diff = arrival - now;
      if (diff < 24 * 60 * 60 * 1000) {
        return false;
      }
    }

    return true;
  }
}
