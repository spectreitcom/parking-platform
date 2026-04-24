import { ParkingFeatureId } from '../parking-feature-id';
import { randomUUID } from 'node:crypto';

describe('ParkingFeatureId', () => {
  it('should create a new ParkingFeatureId with valid UUID', () => {
    const id = ParkingFeatureId.create();
    expect(id.value).toBeDefined();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id.value).toMatch(uuidRegex);
  });

  it('should create from valid UUID string', () => {
    const uuid = randomUUID();
    const id = ParkingFeatureId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID string', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => ParkingFeatureId.fromString(invalidUuid)).toThrow(
      'Invalid ParkingFeatureId',
    );
  });

  it('should return true when comparing two identical IDs', () => {
    const uuid = randomUUID();
    const id1 = ParkingFeatureId.fromString(uuid);
    const id2 = ParkingFeatureId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should return false when comparing two different IDs', () => {
    const id1 = ParkingFeatureId.create();
    const id2 = ParkingFeatureId.create();
    expect(id1.equals(id2)).toBe(false);
  });
});
