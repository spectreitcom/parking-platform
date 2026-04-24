import { ParkingSpotId } from '../parking-spot-id';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

describe('ParkingSpotId', () => {
  it('should create a valid ParkingSpotId object from string', () => {
    const validUuid = randomUUID();
    const parkingSpotId = ParkingSpotId.fromString(validUuid);
    expect(parkingSpotId.value).toBe(validUuid);
  });

  it('should throw an error if ParkingSpotId is an invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => ParkingSpotId.fromString(invalidUuid)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid ParkingSpotId'),
    );
  });

  it('should return true when comparing two identical ParkingSpotIds', () => {
    const validUuid = randomUUID();
    const parkingSpotId1 = ParkingSpotId.fromString(validUuid);
    const parkingSpotId2 = ParkingSpotId.fromString(validUuid);
    expect(parkingSpotId1.equals(parkingSpotId2)).toBe(true);
  });

  it('should return false when comparing two different ParkingSpotIds', () => {
    const parkingSpotId1 = ParkingSpotId.fromString(randomUUID());
    const parkingSpotId2 = ParkingSpotId.fromString(randomUUID());
    expect(parkingSpotId1.equals(parkingSpotId2)).toBe(false);
  });
});
