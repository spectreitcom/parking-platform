import { ReservationStatus } from '../../value-objects/reservation-status';
import { ReservationDateRange } from '../../value-objects/reservation-date-range';
import { ReservationAddon } from '../../value-objects/reservation-addon';
import { CancellationService } from '../cancellation.service';

describe('CancellationService', () => {
  const now = new Date('2024-01-01T12:00:00Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return false if status is cancelled', () => {
    const status = ReservationStatus.cancelled();
    const dateRange = ReservationDateRange.fromValues(
      now + 25 * 60 * 60 * 1000,
      now + 26 * 60 * 60 * 1000,
    );
    expect(CancellationService.canCancel(dateRange, status, [])).toBe(false);
  });

  it('should return false if status is completed', () => {
    const status = ReservationStatus.completed();
    const dateRange = ReservationDateRange.fromValues(
      now + 25 * 60 * 60 * 1000,
      now + 26 * 60 * 60 * 1000,
    );
    expect(CancellationService.canCancel(dateRange, status, [])).toBe(false);
  });

  describe('without canCancel15MinutesBefore addon', () => {
    it('should return true if arrival is more than 24 hours away', () => {
      const status = ReservationStatus.paid();
      const arrival = now + 24 * 60 * 60 * 1000 + 1000; // 24h + 1s
      const dateRange = ReservationDateRange.fromValues(
        arrival,
        arrival + 3600000,
      );
      expect(CancellationService.canCancel(dateRange, status, [])).toBe(true);
    });

    it('should return false if arrival is less than 24 hours away', () => {
      const status = ReservationStatus.paid();
      const arrival = now + 24 * 60 * 60 * 1000 - 1000; // 24h - 1s
      const dateRange = ReservationDateRange.fromValues(
        arrival,
        arrival + 3600000,
      );
      expect(CancellationService.canCancel(dateRange, status, [])).toBe(false);
    });
  });

  describe('with canCancel15MinutesBefore addon', () => {
    const addons = [ReservationAddon.canCancel15MinutesBefore()];

    it('should return true if arrival is more than 15 minutes away', () => {
      const status = ReservationStatus.paid();
      const arrival = now + 15 * 60 * 1000 + 1000; // 15m + 1s
      const dateRange = ReservationDateRange.fromValues(
        arrival,
        arrival + 3600000,
      );
      expect(CancellationService.canCancel(dateRange, status, addons)).toBe(
        true,
      );
    });

    it('should return false if arrival is less than 15 minutes away', () => {
      const status = ReservationStatus.paid();
      const arrival = now + 15 * 60 * 1000 - 1000; // 15m - 1s
      const dateRange = ReservationDateRange.fromValues(
        arrival,
        arrival + 3600000,
      );
      expect(CancellationService.canCancel(dateRange, status, addons)).toBe(
        false,
      );
    });
  });
});
