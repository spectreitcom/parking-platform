import { AssetMimeType } from '../asset-mime-type';
import { AppError } from 'src/shared/errors';

describe('AssetMimeType', () => {
  it('should create a valid asset mime type', () => {
    const mimeTypeStr = 'image/png';
    const mimeType = AssetMimeType.fromString(mimeTypeStr);
    expect(mimeType).toBeDefined();
    expect(mimeType).toBeInstanceOf(AssetMimeType);
  });

  it('should throw error if invalid mime type is provided', () => {
    const invalidMimeType = 'invalid-mime-type';
    expect(() => AssetMimeType.fromString(invalidMimeType)).toThrow(AppError);
    expect(() => AssetMimeType.fromString(invalidMimeType)).toThrow(
      'Invalid AssetMimeType',
    );
  });

  it('should return true if two asset mime types are equal', () => {
    const mimeTypeStr = 'image/png';
    const mimeType1 = AssetMimeType.fromString(mimeTypeStr);
    const mimeType2 = AssetMimeType.fromString(mimeTypeStr);
    expect(mimeType1.equals(mimeType2)).toBe(true);
  });

  it('should return false if two asset mime types are different', () => {
    const mimeType1 = AssetMimeType.fromString('image/png');
    const mimeType2 = AssetMimeType.fromString('application/pdf');
    expect(mimeType1.equals(mimeType2)).toBe(false);
  });
});
