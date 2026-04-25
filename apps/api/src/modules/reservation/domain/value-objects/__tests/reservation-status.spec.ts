import { ReservationStatus } from '../reservation-status';
import {
  RESERVATION_CANCELLED,
  RESERVATION_COMPLETED,
  RESERVATION_CREATED,
  RESERVATION_PAID,
} from 'src/modules/reservation/domain/constants';
import { AppError } from 'src/shared/errors';

describe('ReservationStatus', () => {
  it('should create a valid ReservationStatus object from string', () => {
    const statusValue = RESERVATION_CREATED;
    const status = ReservationStatus.fromString(statusValue);
    expect(status.value).toBe(statusValue);
  });

  it('should create a created status', () => {
    const status = ReservationStatus.created();
    expect(status.value).toBe(RESERVATION_CREATED);
  });

  it('should create a paid status', () => {
    const status = ReservationStatus.paid();
    expect(status.value).toBe(RESERVATION_PAID);
  });

  it('should create a cancelled status', () => {
    const status = ReservationStatus.cancelled();
    expect(status.value).toBe(RESERVATION_CANCELLED);
  });

  it('should create a completed status', () => {
    const status = ReservationStatus.completed();
    expect(status.value).toBe(RESERVATION_COMPLETED);
  });

  it('should throw an error if status is invalid', () => {
    const invalidStatus = 'INVALID_STATUS';
    expect(() => ReservationStatus.fromString(invalidStatus)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationStatus'),
    );
  });

  it('should throw an error if status is empty', () => {
    expect(() => ReservationStatus.fromString('')).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationStatus'),
    );
  });

  it('should return true when comparing two identical ReservationStatuses', () => {
    const status1 = ReservationStatus.created();
    const status2 = ReservationStatus.created();
    expect(status1.equals(status2)).toBe(true);
  });

  it('should return false when comparing two different ReservationStatuses', () => {
    const status1 = ReservationStatus.created();
    const status2 = ReservationStatus.paid();
    expect(status1.equals(status2)).toBe(false);
  });
});
