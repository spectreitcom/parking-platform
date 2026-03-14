import { CartAddonId } from '../cart-addon-id';
import { randomUUID } from 'node:crypto';

describe('CartAddonId', () => {
  it('should create from string', () => {
    const uuid = randomUUID();
    const id = CartAddonId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => CartAddonId.fromString(invalidUuid)).toThrow(
      'Invalid CartAddonId',
    );
  });

  it('should compare two IDs for equality', () => {
    const uuid = randomUUID();
    const id1 = CartAddonId.fromString(uuid);
    const id2 = CartAddonId.fromString(uuid);
    const id3 = CartAddonId.fromString(randomUUID());

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
