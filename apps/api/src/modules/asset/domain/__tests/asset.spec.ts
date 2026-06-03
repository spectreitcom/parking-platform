import { Asset } from '../asset';
import { AssetId } from '../value-objects/asset-id';
import { AssetMimeType } from '../value-objects/asset-mime-type';
import { AssetInvalidError } from '../errors';

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

  it('should throw error if empty key is provided', () => {
    const emptyKey = '';
    const mimeType = 'image/png';
    expect(() => Asset.create(emptyKey, mimeType)).toThrow(AssetInvalidError);
    expect(() => Asset.create(emptyKey, mimeType)).toThrow(
      'Asset key cannot be empty',
    );
  });

  it('should throw error if whitespace-only key is provided', () => {
    const whitespaceKey = '   ';
    const mimeType = 'image/png';
    expect(() => Asset.create(whitespaceKey, mimeType)).toThrow(
      AssetInvalidError,
    );
    expect(() => Asset.create(whitespaceKey, mimeType)).toThrow(
      'Asset key cannot be empty',
    );
  });
});
