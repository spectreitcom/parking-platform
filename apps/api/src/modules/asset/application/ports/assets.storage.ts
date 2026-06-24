export abstract class AssetsStorage {
  abstract insertImage(
    assetId: string,
    userId: string,
    buffer: Buffer,
    width?: number,
    height?: number,
  ): Promise<void>;

  abstract getImage(
    assetId: string,
    userId: string,
    width?: number,
    height?: number,
  ): Promise<Buffer | null>;

  abstract insertImageEtag(
    assetId: string,
    userId: string,
    etag: string,
    width?: number,
    height?: number,
  ): Promise<void>;

  abstract getImageEtag(
    assetId: string,
    userId: string,
    width?: number,
    height?: number,
  ): Promise<string | null>;
}
