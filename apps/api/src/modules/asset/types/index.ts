export type QueryAssetResponse = {
  id: string;
  mimeType: string;
  buffer: Buffer;
};

export type UploadValidationStrategyOptions = 'all' | 'onlyImage';
