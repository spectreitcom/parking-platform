import { AssetId } from '../asset-id';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

describe('AssetId', () => {
  it('should create a valid asset id', () => {
    const assetId = AssetId.create();
    expect(assetId).toBeDefined();
    expect(assetId).toBeInstanceOf(AssetId);
  });

  it('should create asset id from string', () => {
    const uuid = randomUUID();
    const assetId = AssetId.fromString(uuid);
    expect(assetId).toBeDefined();
  });

  it('should throw error if invalid uuid is provided', () => {
    const invalidUuid = 'invalid-uuid';
    expect(() => AssetId.fromString(invalidUuid)).toThrow(AppError);
    expect(() => AssetId.fromString(invalidUuid)).toThrow('Invalid AssetId');
  });

  it('should return true if two asset ids are equal', () => {
    const uuid = randomUUID();
    const assetId1 = AssetId.fromString(uuid);
    const assetId2 = AssetId.fromString(uuid);
    expect(assetId1.equals(assetId2)).toBe(true);
  });

  it('should return false if two asset ids are different', () => {
    const assetId1 = AssetId.create();
    const assetId2 = AssetId.create();
    expect(assetId1.equals(assetId2)).toBe(false);
  });
});
