import { ParkingSpotId } from '../parking-spot-id';

describe('ParkingSpotId', () => {
  it('should create a valid id', () => {
    const id = ParkingSpotId.create();
    expect(id.value).toBeDefined();
    expect(typeof id.value).toBe('string');
  });

  it('should create from string', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const id = ParkingSpotId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid id', () => {
    expect(() => ParkingSpotId.fromString('invalid-uuid')).toThrow(
      'Invalid ParkingSpotId',
    );
  });

  it('should compare two ids', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const id1 = ParkingSpotId.fromString(uuid);
    const id2 = ParkingSpotId.fromString(uuid);
    const id3 = ParkingSpotId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
