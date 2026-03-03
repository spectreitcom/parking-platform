import { ParkingId } from '../parking-id';
import { randomUUID } from 'node:crypto';

describe('ParkingId', () => {
  it('should create a valid UUID', () => {
    const id = ParkingId.create();
    expect(id.value).toBeDefined();
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should create from string', () => {
    const uuid = randomUUID();
    const id = ParkingId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => ParkingId.fromString(invalidUuid)).toThrow(
      'Invalid ParkingId',
    );
  });

  it('should compare two IDs for equality', () => {
    const uuid = randomUUID();
    const id1 = ParkingId.fromString(uuid);
    const id2 = ParkingId.fromString(uuid);
    const id3 = ParkingId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
