import { ParkingSpotId } from '../parking-spot-id';
import { randomUUID } from 'node:crypto';

describe('ParkingSpotId', () => {
  it('should create a valid id', () => {
    const id = ParkingSpotId.create();
    expect(id.value).toBeDefined();
    expect(typeof id.value).toBe('string');
  });

  it('should create from string', () => {
    const uuid = randomUUID();
    const id = ParkingSpotId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid id', () => {
    expect(() => ParkingSpotId.fromString('invalid-uuid')).toThrow(
      'Invalid ParkingSpotId',
    );
  });

  it('should compare two ids', () => {
    const uuid = randomUUID();
    const id1 = ParkingSpotId.fromString(uuid);
    const id2 = ParkingSpotId.fromString(uuid);
    const id3 = ParkingSpotId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
