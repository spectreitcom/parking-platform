import { CartDateRange } from '../cart-date-range';
import { AppError } from 'src/shared/errors';

describe('CartDateRange', () => {
  const now = Date.now();
  const tomorrow = now + 24 * 60 * 60 * 1000;

  it('should create a valid CartDateRange', () => {
    const cartDateRange = CartDateRange.fromValues(now, tomorrow);

    expect(cartDateRange.arrival).toBe(now);
    expect(cartDateRange.departure).toBe(tomorrow);
  });

  it('should throw an error if arrival is negative', () => {
    expect(() => CartDateRange.fromValues(-1, tomorrow)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid CartDateRange'),
    );
  });

  it('should throw an error if arrival is not an integer', () => {
    expect(() => CartDateRange.fromValues(1.5, tomorrow)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid CartDateRange'),
    );
  });

  it('should throw an error if departure is negative', () => {
    expect(() => CartDateRange.fromValues(now, -1)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid CartDateRange'),
    );
  });

  it('should throw an error if departure is not an integer', () => {
    expect(() => CartDateRange.fromValues(now, tomorrow + 0.5)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid CartDateRange'),
    );
  });

  it('should throw an error if departure is before arrival', () => {
    expect(() => CartDateRange.fromValues(tomorrow, now)).toThrow(
      new AppError('VALIDATION_ERROR', 'Departure must be after arrival'),
    );
  });

  it('should throw an error if departure is equal to arrival', () => {
    expect(() => CartDateRange.fromValues(now, now)).toThrow(
      new AppError('VALIDATION_ERROR', 'Departure must be after arrival'),
    );
  });

  describe('diffDays', () => {
    it('should return 1 for a 24-hour difference', () => {
      const oneDay = 24 * 60 * 60 * 1000;
      const range = CartDateRange.fromValues(now, now + oneDay);
      expect(range.diffDays).toBe(1);
    });

    it('should return 2 for a 48-hour difference', () => {
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      const range = CartDateRange.fromValues(now, now + twoDays);
      expect(range.diffDays).toBe(2);
    });

    it('should round up for partial days', () => {
      const partialDay = 1.5 * 24 * 60 * 60 * 1000;
      const range = CartDateRange.fromValues(now, now + partialDay);
      expect(range.diffDays).toBe(2);
    });
  });

  describe('equals', () => {
    it('should return true if arrival and departure are the same', () => {
      const range1 = CartDateRange.fromValues(now, tomorrow);
      const range2 = CartDateRange.fromValues(now, tomorrow);
      expect(range1.equals(range2)).toBe(true);
    });

    it('should return false if arrival is different', () => {
      const range1 = CartDateRange.fromValues(now, tomorrow);
      const range2 = CartDateRange.fromValues(now + 1, tomorrow);
      expect(range1.equals(range2)).toBe(false);
    });

    it('should return false if departure is different', () => {
      const range1 = CartDateRange.fromValues(now, tomorrow);
      const range2 = CartDateRange.fromValues(now, tomorrow + 1);
      expect(range1.equals(range2)).toBe(false);
    });
  });
});
