export type QueryAssetResponse = {
  id: string;
  mimeType: string;
  buffer: Buffer;
  etag: string;
};

export type UploadValidationStrategyOptions = 'all' | 'onlyImage';
