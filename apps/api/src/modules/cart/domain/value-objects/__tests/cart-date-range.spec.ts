import { CartDateRange } from '../cart-date-range';

describe('CartDateRange', () => {
  const arrival = Date.now();
  const departure = arrival + 1000 * 60 * 60 * 24; // 1 day later

  it('should create a valid date range', () => {
    const range = CartDateRange.fromValues(arrival, departure);
    expect(range.arrival).toBe(arrival);
    expect(range.departure).toBe(departure);
  });

  it('should calculate diffDays correctly', () => {
    const range = CartDateRange.fromValues(arrival, departure);
    expect(range.diffDays).toBe(1);

    // 1.5 days should be 2 days
    const range15 = CartDateRange.fromValues(
      arrival,
      arrival + 1000 * 60 * 60 * 36,
    );
    expect(range15.diffDays).toBe(2);

    // 1 second more than 1 day should be 2 days
    const range1Day1Sec = CartDateRange.fromValues(
      arrival,
      arrival + 1000 * 60 * 60 * 24 + 1000,
    );
    expect(range1Day1Sec.diffDays).toBe(2);
  });

  it('should throw error if departure is before or equal to arrival', () => {
    expect(() => CartDateRange.fromValues(departure, arrival)).toThrow(
      'Departure must be after arrival',
    );
    expect(() => CartDateRange.fromValues(arrival, arrival)).toThrow(
      'Departure must be after arrival',
    );
  });

  it('should throw error for invalid values (negative or not integer)', () => {
    expect(() => CartDateRange.fromValues(-1, departure)).toThrow(
      'Invalid CartDateRange',
    );
    expect(() => CartDateRange.fromValues(arrival, -1)).toThrow(
      'Invalid CartDateRange',
    );
  });

  it('should compare two date ranges for equality', () => {
    const range1 = CartDateRange.fromValues(arrival, departure);
    const range2 = CartDateRange.fromValues(arrival, departure);
    const range3 = CartDateRange.fromValues(arrival, departure + 1000);

    expect(range1.equals(range2)).toBe(true);
    expect(range1.equals(range3)).toBe(false);
  });
});
