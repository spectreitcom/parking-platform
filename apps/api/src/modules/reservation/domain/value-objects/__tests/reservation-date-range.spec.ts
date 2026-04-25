import { ReservationDateRange } from '../reservation-date-range';
import { AppError } from 'src/shared/errors';

describe('ReservationDateRange', () => {
  const dayInMs = 1000 * 60 * 60 * 24;
  const arrival = 1682078400000; // 2023-04-21 12:00:00
  const departure = arrival + dayInMs; // 2023-04-22 12:00:00

  it('should create a valid ReservationDateRange object', () => {
    const range = ReservationDateRange.fromValues(arrival, departure);
    expect(range.arrival).toBe(arrival);
    expect(range.departure).toBe(departure);
  });

  it('should throw an error if departure is before arrival', () => {
    expect(() => ReservationDateRange.fromValues(departure, arrival)).toThrow(
      new AppError('VALIDATION_ERROR', 'Departure must be after arrival'),
    );
  });

  it('should throw an error if departure is equal to arrival', () => {
    expect(() => ReservationDateRange.fromValues(arrival, arrival)).toThrow(
      new AppError('VALIDATION_ERROR', 'Departure must be after arrival'),
    );
  });

  it('should throw an error if arrival or departure are not positive', () => {
    expect(() => ReservationDateRange.fromValues(-1, departure)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationDateRange'),
    );
    expect(() => ReservationDateRange.fromValues(arrival, -1)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationDateRange'),
    );
  });

  it('should calculate diffDays correctly for exactly one day', () => {
    const range = ReservationDateRange.fromValues(arrival, departure);
    expect(range.diffDays).toBe(1);
  });

  it('should calculate diffDays correctly for more than one day (ceil)', () => {
    const range = ReservationDateRange.fromValues(
      arrival,
      arrival + dayInMs + 1000,
    );
    expect(range.diffDays).toBe(2);
  });

  it('should return true when comparing two identical date ranges', () => {
    const range1 = ReservationDateRange.fromValues(arrival, departure);
    const range2 = ReservationDateRange.fromValues(arrival, departure);
    expect(range1.equals(range2)).toBe(true);
  });

  it('should return false when comparing two different date ranges', () => {
    const range1 = ReservationDateRange.fromValues(arrival, departure);
    const range2 = ReservationDateRange.fromValues(arrival, departure + 1000);
    expect(range1.equals(range2)).toBe(false);
  });
});
