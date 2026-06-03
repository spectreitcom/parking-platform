import { Asset } from '../asset';
import { AssetId } from '../value-objects/asset-id';
import { AssetMimeType } from '../value-objects/asset-mime-type';

describe('Asset', () => {
  it('should create an asset instance', () => {
    const key = 'test-key';
    const mimeType = 'image/png';
    const asset = Asset.create(key, mimeType);

    expect(asset).toBeDefined();
    expect(asset).toBeInstanceOf(Asset);
    expect(asset.getId()).toBeInstanceOf(AssetId);
    expect(asset.getKey()).toBe(key);
    expect(asset.getMimeType()).toBeInstanceOf(AssetMimeType);
  });

  it('should throw error if invalid mime type is provided', () => {
    const key = 'test-key';
    const invalidMimeType = 'invalid-mime-type';
    expect(() => Asset.create(key, invalidMimeType)).toThrow();
  });
});
