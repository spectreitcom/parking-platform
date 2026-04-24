import { ReservationLine } from '../reservation-line';
import { AppError } from 'src/shared/errors';

describe('ReservationLine', () => {
  const name = 'Parking spot A';
  const price = 1000;

  it('should create a valid ReservationLine object', () => {
    const line = ReservationLine.create(name, price);
    expect(line.title).toBe(name);
    expect(line.price).toBe(price);
  });

  it('should throw an error if name is empty', () => {
    expect(() => ReservationLine.create('', price)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationLine'),
    );
  });

  it('should throw an error if name is too long', () => {
    const longName = 'a'.repeat(256);
    expect(() => ReservationLine.create(longName, price)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationLine'),
    );
  });

  it('should throw an error if price is negative', () => {
    expect(() => ReservationLine.create(name, -1)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationLine'),
    );
  });

  it('should return true when comparing two identical reservation lines', () => {
    const line1 = ReservationLine.create(name, price);
    const line2 = ReservationLine.create(name, price);
    expect(line1.equals(line2)).toBe(true);
  });

  it('should return false when comparing two different reservation lines', () => {
    const line1 = ReservationLine.create(name, price);
    const line2 = ReservationLine.create('different name', price);
    expect(line1.equals(line2)).toBe(false);
  });
});
