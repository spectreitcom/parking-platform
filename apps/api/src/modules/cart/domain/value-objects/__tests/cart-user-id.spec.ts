import { CartUserId } from '../cart-user-id';
import { randomUUID } from 'node:crypto';

describe('CartUserId', () => {
  it('should create from string', () => {
    const uuid = randomUUID();
    const id = CartUserId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => CartUserId.fromString(invalidUuid)).toThrow(
      'Invalid CartUserId',
    );
  });

  it('should compare two IDs for equality', () => {
    const uuid = randomUUID();
    const id1 = CartUserId.fromString(uuid);
    const id2 = CartUserId.fromString(uuid);
    const id3 = CartUserId.fromString(randomUUID());

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
