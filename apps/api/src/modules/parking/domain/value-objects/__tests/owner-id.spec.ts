import { OwnerId } from '../owner-id';
import { randomUUID } from 'node:crypto';

describe('OwnerId', () => {
  it('should create a valid UUID', () => {
    const id = OwnerId.create();
    expect(id.value).toBeDefined();
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should create from string', () => {
    const uuid = randomUUID();
    const id = OwnerId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => OwnerId.fromString(invalidUuid)).toThrow('Invalid OwnerId');
  });

  it('should compare two IDs for equality', () => {
    const uuid = randomUUID();
    const id1 = OwnerId.fromString(uuid);
    const id2 = OwnerId.fromString(uuid);
    const id3 = OwnerId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
