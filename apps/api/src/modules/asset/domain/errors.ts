export class AssetInvalidError extends Error {
  constructor(reason?: string) {
    super(reason);
  }
}
