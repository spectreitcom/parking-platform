import { PlaceTypeId } from '../place-type-id';
import { randomUUID } from 'node:crypto';

describe('PlaceTypeId', () => {
  it('should create a valid UUID', () => {
    const id = PlaceTypeId.create();
    expect(id.value).toBeDefined();
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should create from string', () => {
    const uuid = randomUUID();
    const id = PlaceTypeId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => PlaceTypeId.fromString(invalidUuid)).toThrow(
      'Invalid PlaceTypeId',
    );
  });

  it('should compare two IDs for equality', () => {
    const uuid = randomUUID();
    const id1 = PlaceTypeId.fromString(uuid);
    const id2 = PlaceTypeId.fromString(uuid);
    const id3 = PlaceTypeId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
