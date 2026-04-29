import { ReservationStatus } from '../../value-objects/reservation-status';
import { UpdatingService } from '../updating.service';

describe('UpdatingService', () => {
  it('should return false if status is cancelled', () => {
    const status = ReservationStatus.cancelled();
    expect(UpdatingService.canUpdate(status)).toBe(false);
  });

  it('should return false if status is completed', () => {
    const status = ReservationStatus.completed();
    expect(UpdatingService.canUpdate(status)).toBe(false);
  });

  it('should return true if status is created', () => {
    const status = ReservationStatus.created();
    expect(UpdatingService.canUpdate(status)).toBe(true);
  });

  it('should return true if status is paid', () => {
    const status = ReservationStatus.paid();
    expect(UpdatingService.canUpdate(status)).toBe(true);
  });
});
