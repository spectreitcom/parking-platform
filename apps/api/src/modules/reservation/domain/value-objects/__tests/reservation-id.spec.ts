import { ReservationId } from '../reservation-id';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

describe('ReservationId', () => {
  it('should create a valid ReservationId object from string', () => {
    const validUuid = randomUUID();
    const reservationId = ReservationId.fromString(validUuid);
    expect(reservationId.value).toBe(validUuid);
  });

  it('should create a new ReservationId object with random UUID', () => {
    const reservationId = ReservationId.create();
    expect(reservationId.value).toBeDefined();
    expect(typeof reservationId.value).toBe('string');
    // Check if it's a valid UUID
    expect(() => ReservationId.fromString(reservationId.value)).not.toThrow();
  });

  it('should throw an error if ReservationId is an invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => ReservationId.fromString(invalidUuid)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ReservationId'),
    );
  });

  it('should return true when comparing two identical ReservationIds', () => {
    const validUuid = randomUUID();
    const reservationId1 = ReservationId.fromString(validUuid);
    const reservationId2 = ReservationId.fromString(validUuid);
    expect(reservationId1.equals(reservationId2)).toBe(true);
  });

  it('should return false when comparing two different ReservationIds', () => {
    const reservationId1 = ReservationId.fromString(randomUUID());
    const reservationId2 = ReservationId.fromString(randomUUID());
    expect(reservationId1.equals(reservationId2)).toBe(false);
  });
});
