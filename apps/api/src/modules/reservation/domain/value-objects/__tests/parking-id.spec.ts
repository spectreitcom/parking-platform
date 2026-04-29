import { ParkingId } from '../parking-id';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

describe('ParkingId', () => {
  it('should create a valid ParkingId object from string', () => {
    const validUuid = randomUUID();
    const parkingId = ParkingId.fromString(validUuid);
    expect(parkingId.value).toBe(validUuid);
  });

  it('should throw an error if ParkingId is an invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => ParkingId.fromString(invalidUuid)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ParkingId'),
    );
  });

  it('should return true when comparing two identical ParkingIds', () => {
    const validUuid = randomUUID();
    const parkingId1 = ParkingId.fromString(validUuid);
    const parkingId2 = ParkingId.fromString(validUuid);
    expect(parkingId1.equals(parkingId2)).toBe(true);
  });

  it('should return false when comparing two different ParkingIds', () => {
    const parkingId1 = ParkingId.fromString(randomUUID());
    const parkingId2 = ParkingId.fromString(randomUUID());
    expect(parkingId1.equals(parkingId2)).toBe(false);
  });
});
