import { UserId } from '../user-id';
import { AppError } from 'src/shared/errors';
import { isUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

describe('UserId Value Object', () => {
  it('should create a new UserId with create method', () => {
    const userId = UserId.create();
    expect(isUUID(userId.value)).toBe(true);
  });

  it('should create a valid UserId from string', () => {
    const uuid = randomUUID();
    const userId = UserId.fromString(uuid);
    expect(userId.value).toBe(uuid);
  });

  it('should throw an error if UserId is not a valid UUID', () => {
    const invalidUuid = 'not-a-uuid';
    expect(() => UserId.fromString(invalidUuid)).toThrow(AppError);
    expect(() => UserId.fromString(invalidUuid)).toThrow('Invalid UserId');
  });
});
