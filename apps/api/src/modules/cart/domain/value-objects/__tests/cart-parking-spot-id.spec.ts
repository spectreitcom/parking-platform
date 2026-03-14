import { CartParkingSpotId } from '../cart-parking-spot-id';
import { randomUUID } from 'node:crypto';

describe('CartParkingSpotId', () => {
  it('should create from string', () => {
    const uuid = randomUUID();
    const id = CartParkingSpotId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => CartParkingSpotId.fromString(invalidUuid)).toThrow(
      'Invalid CartParkingSpotId',
    );
  });

  it('should compare two IDs for equality', () => {
    const uuid = randomUUID();
    const id1 = CartParkingSpotId.fromString(uuid);
    const id2 = CartParkingSpotId.fromString(uuid);
    const id3 = CartParkingSpotId.fromString(randomUUID());

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
