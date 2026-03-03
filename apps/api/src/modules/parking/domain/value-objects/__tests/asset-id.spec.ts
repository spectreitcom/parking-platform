import { AssetId } from '../asset-id';
import { randomUUID } from 'node:crypto';

describe('AssetId', () => {
  it('should create a valid UUID', () => {
    const id = AssetId.create();
    expect(id.value).toBeDefined();
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should create from string', () => {
    const uuid = randomUUID();
    const id = AssetId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => AssetId.fromString(invalidUuid)).toThrow('Invalid AssetId');
  });

  it('should compare two IDs for equality', () => {
    const uuid = randomUUID();
    const id1 = AssetId.fromString(uuid);
    const id2 = AssetId.fromString(uuid);
    const id3 = AssetId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
