import { UserId } from '../user-id';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

describe('UserId', () => {
  it('should create a valid UserId object from string', () => {
    const validUuid = randomUUID();
    const userId = UserId.fromString(validUuid);
    expect(userId.value).toBe(validUuid);
  });

  it('should throw an error if UserId is an invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => UserId.fromString(invalidUuid)).toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid UserId'),
    );
  });

  it('should return true when comparing two identical UserIds', () => {
    const validUuid = randomUUID();
    const userId1 = UserId.fromString(validUuid);
    const userId2 = UserId.fromString(validUuid);
    expect(userId1.equals(userId2)).toBe(true);
  });

  it('should return false when comparing two different UserIds', () => {
    const userId1 = UserId.fromString(randomUUID());
    const userId2 = UserId.fromString(randomUUID());
    expect(userId1.equals(userId2)).toBe(false);
  });
});
