import { CartId } from '../cart-id';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

describe('CartId', () => {
  it('should create a valid CartId object from string', () => {
    const validUuid = randomUUID();
    const cartId = CartId.fromString(validUuid);
    expect(cartId.value).toBe(validUuid);
  });

  it('should throw an error if CartId is an invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => CartId.fromString(invalidUuid)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid CartId'),
    );
  });

  it('should return true when comparing two identical CartIds', () => {
    const validUuid = randomUUID();
    const cartId1 = CartId.fromString(validUuid);
    const cartId2 = CartId.fromString(validUuid);
    expect(cartId1.equals(cartId2)).toBe(true);
  });

  it('should return false when comparing two different CartIds', () => {
    const cartId1 = CartId.fromString(randomUUID());
    const cartId2 = CartId.fromString(randomUUID());
    expect(cartId1.equals(cartId2)).toBe(false);
  });
});
